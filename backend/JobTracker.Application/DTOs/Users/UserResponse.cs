namespace JobTracker.Application.DTOs.Users;

public class UserResponse
{
    public int Id { get; set; }
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
}