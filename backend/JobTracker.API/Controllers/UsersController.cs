using JobTracker.API.Extensions;
using JobTracker.Application.DTOs.Users;
using JobTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

 [HttpPost]
public async Task<IActionResult> Create(CreateUserRequest request)
{
    var result = await _userService.CreateAsync(request);
    return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
}

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _userService.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _userService.GetByIdAsync(id);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
    {
        var userId = User.GetUserId();
        var result = await _userService.UpdateProfileAsync(userId, request);

        if (!result) return NotFound();
        return Ok(new { Message = "Profile updated successfully." });
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userId = User.GetUserId();
        var result = await _userService.ChangePasswordAsync(userId, request);

        if (!result) return BadRequest("Invalid current password or user not found.");
        return Ok(new { Message = "Password changed successfully." });
    }
}