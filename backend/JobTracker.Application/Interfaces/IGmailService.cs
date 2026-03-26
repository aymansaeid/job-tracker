namespace JobTracker.Application.Interfaces;

public interface IGmailService
{
    // Generates the Google Login URL
    string GetAuthorizationUrl(int userId);

    // Exchanges the code for a token and saves it to the user
    Task<bool> ExchangeCodeForTokenAsync(int userId, string code);
}