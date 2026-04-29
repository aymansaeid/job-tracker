using JobTracker.Application.Interfaces;
using JobTracker.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobTracker.API.Controllers;

[Authorize] // logged-in users only
[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    // Helper method to safely extract the User ID from the JWT Token
    private int GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim, out int userId) ? userId : 0;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyDocuments()
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        var documents = await _documentService.GetUserDocumentsAsync(userId);
        return Ok(documents);
    }

    [HttpPost("upload")]
    // Note: We use [FromForm] here because React will send a FormData object, not JSON!
    public async Task<IActionResult> UploadDocument([FromForm] IFormFile file, [FromForm] DocumentCategory category, [FromForm] bool isPrimary = false)
    {
        try
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var document = await _documentService.UploadDocumentAsync(userId, file, category, isPrimary);

            return Ok(document);
        }
        catch (ArgumentException ex)
        {
            // Catches our custom limits (e.g., "File is over 5MB" or "Max 5 CVs reached")
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Log the actual exception here in production!
            return StatusCode(500, new { message = "An unexpected error occurred while saving the document." });
        }
    }

    [HttpPut("{id}/primary")]
    public async Task<IActionResult> SetPrimaryResume(int id)
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        var success = await _documentService.SetPrimaryResumeAsync(userId, id);

        if (!success)
            return NotFound(new { message = "Document not found or you don't have permission to edit it." });

        return Ok(new { message = "Primary resume updated successfully." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocument(int id)
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        var success = await _documentService.DeleteDocumentAsync(userId, id);

        if (!success)
            return NotFound(new { message = "Document not found." });

        return Ok(new { message = "Document deleted successfully." });
    }
}