using JobTracker.Application.DTOs.Applications;
using JobTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.API.Controllers;

[ApiController]
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
        var result = await _jobApplicationService.CreateAsync(request);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _jobApplicationService.GetByIdAsync(id);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var result = await _jobApplicationService.GetByUserIdAsync(userId);
        return Ok(result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateJobApplicationRequest request)
    {
        var result = await _jobApplicationService.UpdateAsync(id, request);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("{id:int}/stage")]
    public async Task<IActionResult> ChangeStage(int id, ChangeApplicationStageRequest request)
    {
        var result = await _jobApplicationService.ChangeStageAsync(id, request);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("{id:int}/archive")]
    public async Task<IActionResult> Archive(int id)
    {
        var result = await _jobApplicationService.ArchiveAsync(id);

        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpGet("{id:int}/history")]
    public async Task<IActionResult> GetHistory(int id)
    {
        var result = await _jobApplicationService.GetStageHistoryAsync(id);
        return Ok(result);
    }
}