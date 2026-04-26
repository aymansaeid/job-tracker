using System.Text;
using System.Text.Json;
using JobTracker.Application.DTOs.Integrations;
using JobTracker.Application.Interfaces;
using JobTracker.Domain.Enums;
using Microsoft.Extensions.Configuration;

namespace JobTracker.Infrastructure.Services;

public class GeminiEmailParserService : IEmailParserService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public GeminiEmailParserService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["AI:GeminiApiKey"]
                  ?? throw new ArgumentNullException("Gemini API Key is missing in appsettings.json");
    }

    public async Task<ParsedEmailResult> ParseEmailAsync(string subject, string plainTextBody)
    {
        var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";

        // 1. We tell the AI exactly how to behave and what JSON structure to return
        var systemPrompt = @"You are an AI assistant that extracts job application updates from emails. 
Analyze the email and return ONLY a raw JSON object. Ignore LinkedIn 'similar jobs' spam.

{
  ""IsJobRelated"": boolean (true if it's a job application, assessment, interview, offer, or rejection),
  ""CompanyName"": string or null,
  ""JobTitle"": string or null (Extract the exact role, e.g., 'Backend Intern' or 'Software Engineer'),
  ""Location"": string or null (Extract city, country, or 'Remote' if mentioned),
  ""SuggestedStage"": integer or null (0=Applied/Sent, 1=Viewed, 2=Interview/Assessment, 3=Offer, 4=Rejected),
  ""SuggestedInterviewDate"": string or null (ISO 8601 date format),
  ""AiReasoning"": string (A 25-word summary in English),
  ""ActionUrl"": string or null (Assessment, Meet, or Zoom links),
  ""ExtraNotes"": string or null (Extract any important requirements, next steps, or specific instructions mentioned in the email)
}
Do not include markdown tags like ```json. Just return the raw JSON object.";

        var userPrompt = $"Subject: {subject}\n\nBody: {plainTextBody}";

        // 2. Build the request payload for Gemini
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[] { new { text = systemPrompt + "\n\n" + userPrompt } }
                }
            },
            generationConfig = new
            {
                temperature = 0.1,
                responseMimeType = "application/json" // FIX: Must be camelCase!
            }
        };
        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var content = new StringContent(JsonSerializer.Serialize(requestBody, jsonOptions), Encoding.UTF8, "application/json");
        try
        {
            // 3. Call the AI
            var response = await _httpClient.PostAsync(endpoint, content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Gemini API Error: {error}");
                return new ParsedEmailResult { IsJobRelated = false, AiReasoning = "AI API error." };
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();

            // 4. Parse the Gemini response structure
            using var document = JsonDocument.Parse(jsonResponse);
            var aiTextResponse = document.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            // 5. Deserialize the JSON string into our C# DTO
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var result = JsonSerializer.Deserialize<ParsedEmailResult>(aiTextResponse!, options);

            return result ?? new ParsedEmailResult { IsJobRelated = false };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to parse email with AI: {ex.Message}");
            return new ParsedEmailResult { IsJobRelated = false, AiReasoning = "Failed to parse email." };
        }
    }
}