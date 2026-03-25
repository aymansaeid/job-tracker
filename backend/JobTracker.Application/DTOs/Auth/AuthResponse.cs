namespace JobTracker.Application.DTOs.Auth;

public class AuthResponse
{
    public int Id { get; set; }
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Token { get; set; } = default!;
}