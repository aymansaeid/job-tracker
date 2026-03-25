using System.Security.Claims;

namespace JobTracker.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var userIdValue = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue))
            throw new UnauthorizedAccessException("User id claim is missing.");

        return int.Parse(userIdValue);
    }
}