using JobTracker.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Net.Mail;

namespace JobTracker.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var apiKey = _config["SendGrid:ApiKey"];
        var fromEmail = _config["SendGrid:FromEmail"];

        var client = new SendGridClient(apiKey);

        var from = new EmailAddress(fromEmail, "JobTracker");
        var to = new EmailAddress(toEmail);

        var msg = MailHelper.CreateSingleEmail(
            from,
            to,
            subject,
            "THIS IS A TEST",
            htmlBody
        );

        var response = await client.SendEmailAsync(msg);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception(await response.Body.ReadAsStringAsync());
        }
    }
}