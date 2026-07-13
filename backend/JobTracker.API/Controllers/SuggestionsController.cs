using JobTracker.API.Extensions;
using JobTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SuggestionsController : ControllerBase
{
    private readonly ISuggestionService _suggestionService;

    public SuggestionsController(ISuggestionService suggestionService)
    {
        _suggestionService = suggestionService;
    }

    [HttpPost("sync")]
    public async Task<IActionResult> SyncEmails()
    {
        try
        {
            var userId = User.GetUserId();
            var result = await _suggestionService.ProcessRecentEmailsAsync(userId);

            if (result.RateLimited)
            {
                return StatusCode(429, new
                {
                    message = result.Message,
                    retryAfterMinutes = result.RetryAfterMinutes
                });
            }

            if (!result.Success)
            {
                return StatusCode(500, new { message = result.Message });
            }

            return Ok(new { Message = result.Message });
        }
        catch (UnauthorizedAccessException ex) when (ex.Message == "GMAIL_TOKEN_EXPIRED")
        {
            // 👈 NEW: Send the 403 back to React
            return StatusCode(403, new
            {
                code = "GMAIL_TOKEN_EXPIRED",
                message = "Your Gmail session expired. Please reconnect to continue syncing."
            });
        }
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
    {
        var userId = User.GetUserId();
        var suggestions = await _suggestionService.GetPendingSuggestionsAsync(userId);
        return Ok(suggestions);
    }

    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        var userId = User.GetUserId();
        var result = await _suggestionService.ApproveSuggestionAsync(userId, id);

        if (!result) return NotFound("Suggestion not found or already processed.");
        return Ok(new { Message = "Suggestion approved and database updated!" });
    }

    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> Reject(int id)
    {
        var userId = User.GetUserId();
        var result = await _suggestionService.RejectSuggestionAsync(userId, id);

        if (!result) return NotFound();
        return Ok(new { Message = "Suggestion ignored." });
    }
}