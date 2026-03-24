using FluentValidation;
using JobTracker.Application.DTOs.Users;
using JobTracker.Application.Exceptions;
using JobTracker.Application.Interfaces;
using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    private readonly IValidator<CreateUserRequest> _createUserValidator;

    public UserService(
        ApplicationDbContext context,
        IValidator<CreateUserRequest> createUserValidator)
    {
        _context = context;
        _createUserValidator = createUserValidator;
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request)
    {
        await _createUserValidator.ValidateAndThrowAsync(request);

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (existingUser is not null)
            throw new ConflictException("Email already exists.");

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = request.Password
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email
        };
    }

    public async Task<List<UserResponse>> GetAllAsync()
    {
        return await _context.Users
            .Select(x => new UserResponse
            {
                Id = x.Id,
                FullName = x.FullName,
                Email = x.Email
            })
            .ToListAsync();
    }

    public async Task<UserResponse?> GetByIdAsync(int id)
    {
        return await _context.Users
            .Where(x => x.Id == id)
            .Select(x => new UserResponse
            {
                Id = x.Id,
                FullName = x.FullName,
                Email = x.Email
            })
            .FirstOrDefaultAsync();
    }
}