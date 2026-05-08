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
    public async Task<IActionResult> UploadDocument([FromForm] UploadDocumentRequest request)
    {
        try
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            // Pass the properties from the request object into your service
            var document = await _documentService.UploadDocumentAsync(
                userId,
                request.File,
                request.Category,
                request.IsPrimary);

            return Ok(document);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
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