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

        // Return a tiny HTML script that tells the React app it succeeded and closes the popup
        var html = @"
            <html>
                <body>
                    <script>
                        // Tell the React parent window we succeeded
                        window.opener.postMessage('google_auth_success', '*');
                        // Automatically close this popup
                        window.close();
                    </script>
                </body>
            </html>";

        return Content(html, "text/html");
    }


    [Authorize]
    [HttpGet("google/emails/{messageId}")]
    public async Task<IActionResult> GetEmailBody(string messageId)
    {
        var userId = User.GetUserId();
        var email = await _gmailService.GetEmailBodyAsync(userId, messageId);

        if (email == null)
            return NotFound("Email not found or Gmail not connected.");

        return Ok(email);
    }

    [HttpDelete("google")]
    public async Task<IActionResult> Disconnect()
    {
        var userId = User.GetUserId();
        var result = await _gmailService.DisconnectAsync(userId);

        if (!result) return BadRequest("Gmail is not currently connected.");

        return Ok(new { Message = "Gmail disconnected successfully." });
    }
}