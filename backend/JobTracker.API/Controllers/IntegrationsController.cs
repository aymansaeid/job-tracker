using JobTracker.API.Extensions;
using JobTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IntegrationsController : ControllerBase
{
    private readonly IGmailService _gmailService;

    public IntegrationsController(IGmailService gmailService)
    {
        _gmailService = gmailService;
    }

    [Authorize]
    [HttpGet("google/auth-url")]
    public IActionResult GetGoogleAuthUrl()
    {
        var userId = User.GetUserId();
        var url = _gmailService.GetAuthorizationUrl(userId);

        return Ok(new { Url = url });
    }

    // Notice this is AllowAnonymous because Google is calling this endpoint, not our frontend
    [AllowAnonymous]
    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallback([FromQuery] string code, [FromQuery] string state)
    {
        if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(state))
            return BadRequest("Invalid callback parameters.");

        // The state contains our userId
        if (!int.TryParse(state, out int userId))
            return BadRequest("Invalid state parameter.");

        var success = await _gmailService.ExchangeCodeForTokenAsync(userId, code);

        if (!success)
            return BadRequest("Failed to connect Gmail account.");

        // In a real app, you would redirect back to your React frontend here
        // e.g., return Redirect("http://localhost:5173/settings?integration=success");
        return Ok(new { Message = "Gmail connected successfully! You can close this window." });
    }

    [Authorize]
    [HttpGet("google/emails/recent")]
    public async Task<IActionResult> GetRecentJobEmails([FromQuery] int limit = 10)
    {
        var userId = User.GetUserId();
        var emails = await _gmailService.GetRecentJobEmailsAsync(userId, limit);

        return Ok(emails);
    }
}