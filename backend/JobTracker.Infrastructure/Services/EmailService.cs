using JobTracker.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace JobTracker.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        // Read keys with fallback support for both local JSON and cloud environment variables
        var apiKey = _config["SendGrid:ApiKey"] ?? _config["SendGrid:API_KEY"];
        var fromEmail = _config["SendGrid:SenderEmail"] ?? _config["SendGrid:FromEmail"];
        var fromName = _config["SendGrid:SenderName"] ?? _config["SendGrid:FromName"] ?? "JobTracker AI";

        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(fromEmail))
        {
            _logger.LogError("SendGrid configuration is missing. Verify ApiKey and SenderEmail are set.");
            throw new InvalidOperationException("SendGrid email credentials are not properly configured.");
        }

        var client = new SendGridClient(apiKey);
        var from = new EmailAddress(fromEmail, fromName);
        var to = new EmailAddress(toEmail);

        // Clean plain-text fallback for email clients that disable HTML rendering
        var plainTextContent = "Please view this email in an HTML-compatible email client.";

        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlBody);

        _logger.LogInformation("Dispatching SendGrid email to {ToEmail} with subject: {Subject}", toEmail, subject);

        var response = await client.SendEmailAsync(msg);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Body.ReadAsStringAsync();
            _logger.LogError("SendGrid API Error ({StatusCode}): {ErrorBody}", response.StatusCode, errorBody);
            throw new Exception($"SendGrid email delivery failed ({response.StatusCode}): {errorBody}");
        }

        _logger.LogInformation("Email successfully delivered to {ToEmail}.", toEmail);
    }
}