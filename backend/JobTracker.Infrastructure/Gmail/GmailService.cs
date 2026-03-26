using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Requests; 
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Gmail.v1;
using JobTracker.Application.Interfaces;
using JobTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace JobTracker.Infrastructure.Gmail;

public class GmailService : IGmailService
{
    private readonly ApplicationDbContext _context;
    private readonly GoogleAuthSettings _settings;
    private readonly GoogleAuthorizationCodeFlow _flow;

    public GmailService(ApplicationDbContext context, IOptions<GoogleAuthSettings> settings)
    {
        _context = context;
        _settings = settings.Value;

        // Initialize the Google OAuth Flow
        _flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
        {
            ClientSecrets = new ClientSecrets
            {
                ClientId = _settings.ClientId,
                ClientSecret = _settings.ClientSecret
            },
            // FIX 1: Fully qualify Google's GmailService to avoid the naming collision
            Scopes = new[] { Google.Apis.Gmail.v1.GmailService.Scope.GmailReadonly },
            DataStore = null
        });
    }

    public string GetAuthorizationUrl(int userId)
    {
        // FIX 2: Cast the base request to GoogleAuthorizationCodeRequestUrl
        var request = (GoogleAuthorizationCodeRequestUrl)_flow.CreateAuthorizationCodeRequest(_settings.RedirectUri);

        request.State = userId.ToString();

        // Force approval prompt to ensure we get a refresh token
        request.Prompt = "consent";
        request.AccessType = "offline";

        return request.Build().ToString();
    }

    public async Task<bool> ExchangeCodeForTokenAsync(int userId, string code)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user is null) return false;

        // Exchange the authorization code for tokens
        var tokenResponse = await _flow.ExchangeCodeForTokenAsync(
            userId.ToString(),
            code,
            _settings.RedirectUri,
            CancellationToken.None);

        if (string.IsNullOrWhiteSpace(tokenResponse.RefreshToken))
        {
            // If the user previously connected and didn't revoke access, Google might not send a new refresh token.
            if (string.IsNullOrWhiteSpace(user.GoogleRefreshToken))
                return false;
        }
        else
        {
            // Save the new refresh token to the database
            user.GoogleRefreshToken = tokenResponse.RefreshToken;
            await _context.SaveChangesAsync();
        }

        return true;
    }
}