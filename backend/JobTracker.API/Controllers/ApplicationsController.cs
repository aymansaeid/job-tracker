using JobTracker.API.Extensions;
using JobTracker.Application.DTOs.Applications;
using JobTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly IJobApplicationService _jobApplicationService;

    public ApplicationsController(IJobApplicationService jobApplicationService)
    {
        _jobApplicationService = jobApplicationService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateJobApplicationRequest request)
    {
        var userId = User.GetUserId();
        var result = await _jobApplicationService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = User.GetUserId();
        var result = await _jobApplicationService.GetByIdAsync(userId, id);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpGet("token-check")]
    public IActionResult GetMyApplications()
    {
        var userId = User.GetUserId();
        return Ok($"User ID from token: {userId}");
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var userId = User.GetUserId();
        var result = await _jobApplicationService.GetByUserIdAsync(userId);
        return Ok(result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateJobApplicationRequest request)
    {
        var userId = User.GetUserId(); 
        var result = await _jobApplicationService.UpdateAsync(userId, id, request);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("{id:int}/stage")]
    public async Task<IActionResult> ChangeStage(int id, ChangeApplicationStageRequest request)
    {
        var userId = User.GetUserId(); 
        var result = await _jobApplicationService.ChangeStageAsync(userId, id, request);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("{id:int}/archive")]
    public async Task<IActionResult> Archive(int id)
    {
        var userId = User.GetUserId(); 
        var result = await _jobApplicationService.ArchiveAsync(userId, id);

        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpGet("{id:int}/history")]
    public async Task<IActionResult> GetHistory(int id)
    {
        var userId = User.GetUserId();
        var result = await _jobApplicationService.GetStageHistoryAsync(userId, id);
        return Ok(result);
    }
}