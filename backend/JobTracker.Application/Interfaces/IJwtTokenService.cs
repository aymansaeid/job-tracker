using JobTracker.Domain.Entities;

namespace JobTracker.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}