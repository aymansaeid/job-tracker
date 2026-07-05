using System.Net;
using JobTracker.Application.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.API.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IWebHostEnvironment _env; 

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IWebHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        // Log the real error to your server console
        _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);

        var problemDetails = new ProblemDetails
        {
            Instance = httpContext.Request.Path
        };

        switch (exception)
        {
            case NotFoundException:
                problemDetails.Title = "Resource not found";
                problemDetails.Detail = exception.Message;
                problemDetails.Status = (int)HttpStatusCode.NotFound;
                break;

            case ConflictException:
                problemDetails.Title = "Conflict";
                problemDetails.Detail = exception.Message;
                problemDetails.Status = (int)HttpStatusCode.Conflict;
                break;

            case BadRequestException:
                problemDetails.Title = "Bad request";
                problemDetails.Detail = exception.Message;
                problemDetails.Status = (int)HttpStatusCode.BadRequest;
                break;

            case FluentValidation.ValidationException validationException:
                problemDetails.Title = "Validation failed";
                problemDetails.Detail = "One or more validation errors occurred.";
                problemDetails.Status = (int)HttpStatusCode.BadRequest;
                problemDetails.Extensions["errors"] = validationException.Errors
                    .GroupBy(x => x.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(x => x.ErrorMessage).ToArray());
                break;

            default:
                problemDetails.Title = "Server error";
                problemDetails.Status = (int)HttpStatusCode.InternalServerError;

                if (_env.IsDevelopment())
                {
                    problemDetails.Detail = exception.Message;
                    problemDetails.Extensions["trace"] = exception.StackTrace;
                }
                else
                {
                    problemDetails.Detail = "An unexpected error occurred.";
                }
                break;
        }

        httpContext.Response.StatusCode = problemDetails.Status.Value;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}