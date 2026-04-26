using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Requests; 
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Gmail.v1;
using Google.Apis.Services;
using JobTracker.Application.DTOs.Integrations;
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

    public async Task<List<EmailMessageResponse>> GetRecentJobEmailsAsync(int userId, int maxResults = 10)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user is null || string.IsNullOrWhiteSpace(user.GoogleRefreshToken))
            return new List<EmailMessageResponse>(); // User hasn't connected Gmail

        // 1. Create Google Credentials using the saved Refresh Token
        var token = new TokenResponse { RefreshToken = user.GoogleRefreshToken };
        var credential = new UserCredential(_flow, userId.ToString(), token);

        // 2. Initialize the Gmail API Client
        var gmailClient = new Google.Apis.Gmail.v1.GmailService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "JobTracker API"
        });

        // 3. Search for job-related emails from the last 30 days
        // You can tweak this query to be as specific as you want
        var request = gmailClient.Users.Messages.List("me");
        request.Q = "(subject:application OR subject:interview OR subject:offer OR subject:rejection OR subject:assessment OR subject:challenge) newer_than:30d"; request.MaxResults = maxResults;

        var response = await request.ExecuteAsync();
        var emails = new List<EmailMessageResponse>();

        if (response.Messages is null || !response.Messages.Any())
            return emails;

        // 4. Fetch the actual content for each message found
        foreach (var messageItem in response.Messages)
        {
            var msgRequest = gmailClient.Users.Messages.Get("me", messageItem.Id);
            msgRequest.Format = UsersResource.MessagesResource.GetRequest.FormatEnum.Metadata;
            msgRequest.MetadataHeaders = new List<string> { "Subject", "From", "Date" };

            var msgData = await msgRequest.ExecuteAsync();

            var headers = msgData.Payload.Headers;
            var subject = headers.FirstOrDefault(h => h.Name == "Subject")?.Value ?? "No Subject";
            var sender = headers.FirstOrDefault(h => h.Name == "From")?.Value ?? "Unknown Sender";
            var dateStr = headers.FirstOrDefault(h => h.Name == "Date")?.Value;

            DateTime.TryParse(dateStr, out DateTime dateReceived);

            emails.Add(new EmailMessageResponse
            {
                MessageId = msgData.Id,
                Subject = subject,
                Sender = sender,
                Snippet = msgData.Snippet, // A short preview of the email body
                DateReceived = dateReceived
            });
        }

        return emails.OrderByDescending(e => e.DateReceived).ToList();
    }

    public async Task<EmailFullResponse?> GetEmailBodyAsync(int userId, string messageId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user is null || string.IsNullOrWhiteSpace(user.GoogleRefreshToken))
            return null;

        var token = new TokenResponse { RefreshToken = user.GoogleRefreshToken };
        var credential = new UserCredential(_flow, userId.ToString(), token);
        var gmailClient = new Google.Apis.Gmail.v1.GmailService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "JobTracker API"
        });

        // Fetch the FULL email this time, not just metadata
        var request = gmailClient.Users.Messages.Get("me", messageId);
        request.Format = UsersResource.MessagesResource.GetRequest.FormatEnum.Full;
        var msgData = await request.ExecuteAsync();

        if (msgData == null) return null;

        var headers = msgData.Payload.Headers;
        var subject = headers.FirstOrDefault(h => h.Name == "Subject")?.Value ?? "No Subject";
        var sender = headers.FirstOrDefault(h => h.Name == "From")?.Value ?? "Unknown Sender";
        DateTime.TryParse(headers.FirstOrDefault(h => h.Name == "Date")?.Value, out DateTime dateReceived);

        string htmlBody = "";
        string plainText = "";

        // Extract the body (Gmail nests email parts depending on if it has attachments/HTML)
        if (msgData.Payload.Parts != null)
        {
            foreach (var part in msgData.Payload.Parts)
            {
                if (part.MimeType == "text/html" && part.Body?.Data != null)
                    htmlBody = DecodeBase64Url(part.Body.Data);
                else if (part.MimeType == "text/plain" && part.Body?.Data != null)
                    plainText = DecodeBase64Url(part.Body.Data);
            }
        }
        else if (msgData.Payload.Body?.Data != null)
        {
            // Simple emails with no parts
            if (msgData.Payload.MimeType == "text/html")
                htmlBody = DecodeBase64Url(msgData.Payload.Body.Data);
            else
                plainText = DecodeBase64Url(msgData.Payload.Body.Data);
        }

        return new EmailFullResponse
        {
            MessageId = msgData.Id,
            Subject = subject,
            Sender = sender,
            DateReceived = dateReceived,
            HtmlBody = htmlBody,
            PlainTextBody = plainText
        };
    }

    // Helper method to decode Google's special Base64 string
    private string DecodeBase64Url(string base64Url)
    {
        var base64 = base64Url.Replace('-', '+').Replace('_', '/');
        switch (base64.Length % 4)
        {
            case 2: base64 += "=="; break;
            case 3: base64 += "="; break;
        }
        var bytes = Convert.FromBase64String(base64);
        return System.Text.Encoding.UTF8.GetString(bytes);
    }

    public async Task<bool> DisconnectAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || string.IsNullOrWhiteSpace(user.GoogleRefreshToken))
            return false;

        // Clear the token from our database
        user.GoogleRefreshToken = null;
        await _context.SaveChangesAsync();

        return true;
    }

}