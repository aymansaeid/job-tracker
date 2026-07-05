using JobTracker.API.Extensions;
using JobTracker.Application.DTOs.Users;
using JobTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization; 
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.API.Controllers;

[Authorize] 
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.GetUserId();

        var result = await _userService.GetByIdAsync(userId);

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