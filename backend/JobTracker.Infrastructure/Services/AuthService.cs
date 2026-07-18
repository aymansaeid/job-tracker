using BCrypt.Net;
using FluentValidation;
using JobTracker.Application.DTOs.Auth;
using JobTracker.Application.Exceptions;
using JobTracker.Application.Interfaces;
using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;

namespace JobTracker.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AuthService(
        ApplicationDbContext context,
        IValidator<RegisterRequest> registerValidator,
        IValidator<LoginRequest> loginValidator,
        IJwtTokenService jwtTokenService,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _context = context;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
        _jwtTokenService = jwtTokenService;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        await _registerValidator.ValidateAndThrowAsync(request);

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (existingUser is not null)
            throw new ConflictException("Email already exists.");

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _jwtTokenService.GenerateToken(user);

        return new AuthResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Token = token,
            IsGmailConnected = false
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        await _loginValidator.ValidateAndThrowAsync(request);

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (user is null)
            throw new BadRequestException("Invalid email or password.");

        var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

        if (!isPasswordValid)
            throw new BadRequestException("Invalid email or password.");

        var token = _jwtTokenService.GenerateToken(user);

        return new AuthResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Token = token,
            IsGmailConnected = !string.IsNullOrWhiteSpace(user.GoogleRefreshToken)
        };
    }
    public async Task<bool> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == request.Email);

        // SECURITY BEST PRACTICE: We pretend it worked even if the email doesn't exist.
        // This prevents hackers from using the "Forgot Password" form to guess which emails are registered.
        if (user is null) return true;

        // 1. Generate a cryptographically secure, random 64-character token
        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        var token = Convert.ToHexString(tokenBytes);

        // 2. Save it to the database, valid for 30 minutes
        user.ResetPasswordToken = token;
        user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddMinutes(30);
        await _context.SaveChangesAsync();

        // 3. Build the reset link (Pointing to your React frontend!)
        // Note: Change localhost:5173 to your production URL later
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
        var resetLink = $"{frontendUrl}/reset-password?token={token}";

        // 4. Send the email
        var emailBody = $@"
        <h2>JobTracker Password Reset</h2>
        <p>You requested a password reset. Click the link below to choose a new password:</p>
        <p><a href='{resetLink}'>Reset My Password</a></p>
        <p><i>If you did not request this, please ignore this email. The link expires in 30 minutes.</i></p>";

        await _emailService.SendEmailAsync(user.Email, "Reset Your JobTracker Password", emailBody);

        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request)
    {
        // Find the user who has this exact token, and ensure it hasn't expired
        var user = await _context.Users.FirstOrDefaultAsync(x =>
            x.ResetPasswordToken == request.Token &&
            x.ResetPasswordTokenExpiry > DateTime.UtcNow);

        if (user is null)
            throw new BadRequestException("Invalid or expired password reset token.");

        // Hash the new password and update the user
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        // Clear the token so it can't be used again!
        user.ResetPasswordToken = null;
        user.ResetPasswordTokenExpiry = null;

        await _context.SaveChangesAsync();
        return true;
    }
}