using BCrypt.Net;
using FluentValidation;
using JobTracker.Application.DTOs.Auth;
using JobTracker.Application.Exceptions;
using JobTracker.Application.Interfaces;
using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(
        ApplicationDbContext context,
        IValidator<RegisterRequest> registerValidator,
        IValidator<LoginRequest> loginValidator,
        IJwtTokenService jwtTokenService)
    {
        _context = context;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
        _jwtTokenService = jwtTokenService;
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
            Token = token
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
            Token = token
        };
    }
}