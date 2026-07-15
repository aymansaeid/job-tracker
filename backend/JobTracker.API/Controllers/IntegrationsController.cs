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

        if (!int.TryParse(state, out int userId))
            return BadRequest("Invalid state parameter.");

        var success = await _gmailService.ExchangeCodeForTokenAsync(userId, code);

        if (!success)
            return BadRequest("Failed to connect Gmail account.");

        // No single-line comments (//) are used here to prevent accidental script breaking.
        // Includes a fallback redirect to your live Vercel app if opened as a full tab.
        var html = @"
        <!DOCTYPE html>
        <html>
        <head><title>Gmail Connected</title></head>
        <body style='background-color: #0f172a; color: #22d3ee; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;'>
            <div style='text-align: center;'>
                <h3 style='margin-bottom: 8px;'>Gmail Connected Successfully!</h3>
                <p style='color: #94a3b8; font-size: 14px;'>Closing window...</p>
            </div>
            <script>
                try {
                    if (window.opener && !window.opener.closed) {
                        window.opener.postMessage('google_auth_success', '*');
                        setTimeout(function() { window.close(); }, 800);
                    } else {
                        window.location.href = 'https://jobtracker-sys.vercel.app/app/dashboard';
                    }
                } catch (e) {
                    window.location.href = 'https://jobtracker-sys.vercel.app/app/dashboard';
                }
            </script>
        </body>
        </html>";

        return Content(html, "text/html");
    }


    [Authorize]
    [HttpGet("google/emails/{messageId}")]
    public async Task<IActionResult> GetEmailBody(string messageId)
    {
        try
        {
            var userId = User.GetUserId();
            var email = await _gmailService.GetEmailBodyAsync(userId, messageId);

            if (email == null)
                return NotFound("Email not found or Gmail not connected.");

            return Ok(email);
        }
        catch (UnauthorizedAccessException ex) when (ex.Message == "GMAIL_TOKEN_EXPIRED")
        {
            return StatusCode(403, new
            {
                code = "GMAIL_TOKEN_EXPIRED",
                message = "Your Gmail session expired. Please reconnect."
            });
        }
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