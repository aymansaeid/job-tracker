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
        var systemPrompt = @"You are a multilingual job-application email parser. Emails may be in any language (Turkish, Arabic, English, etc.). Analyze in the original language, but output must follow the exact English JSON schema below.

OUTPUT RULES:
- Respond with ONLY the raw JSON object. No markdown fences, no explanations, no text before or after.
- Never translate the JSON keys.
- Keep JobTitle, Location, ExtraNotes in the email's original language, extracted verbatim where possible.
- Write AiReasoning in English (max 25 words).
- If a field cannot be determined, use null. Never invent values.

JOB-RELATED (return IsJobRelated=true):
- Any email about a job application the user actually submitted: application received/submitted confirmations, 'your application was viewed' notifications, interview or assessment invitations, scheduling emails, job offers, and rejections.
- The email's language NEVER affects this decision. A Turkish or Arabic interview invitation is just as job-related as an English one.

NOT JOB-RELATED (return IsJobRelated=false, all other fields null):
- LinkedIn 'similar jobs' / 'jobs for you' digests, job alerts, newsletters, recruiting ads, promotional emails, or anything not about an application the user actually submitted.

STAGE MAPPING (SuggestedStage):
- 0 = Application submitted/received confirmation
- 1 = Application viewed by recruiter/employer
- 2 = Interview invitation, scheduling, or assessment/test/coding challenge invite
- 3 = Job offer
- 4 = Rejection
- If the email reflects multiple states, choose the LATEST status (e.g., a rejection mentioning past interviews = 4).
- If job-related but no stage is inferable, use null.

DATES:
- SuggestedInterviewDate: if a specific interview/assessment date OR a relative day is stated (e.g., 'next Friday', 'önümüzdeki Cuma', 'يوم الأربعاء القادم'), RESOLVE it to an absolute date using Today's date and its weekday given in the user message.
- Format: ISO 8601 (yyyy-MM-ddTHH:mm:ss if a time is given, otherwise yyyy-MM-dd).
- Only use null if the date is genuinely unresolvable (e.g., 'in a few days', 'soon'), and mention the vague timing in ExtraNotes.

FIELD RULES:
- CompanyName: the HIRING company, never the job board or ATS platform that sent the email (not LinkedIn, Kariyer.net, Greenhouse, Workable, etc.).
- Location: city, country, 'Remote', or 'Hybrid' if stated; otherwise null.
- ActionUrl: the single most actionable link (assessment platform, Zoom/Meet/Teams meeting link, scheduling link). Exclude unsubscribe, tracking, and marketing links.
- ExtraNotes: requirements, deadlines, next steps, documents requested, confirmation instructions (e.g., 'reply by tomorrow to confirm').

JSON SCHEMA (return exactly these keys, no comments):
{
  ""IsJobRelated"": boolean,
  ""CompanyName"": string|null,
  ""JobTitle"": string|null,
  ""Location"": string|null,
  ""SuggestedStage"": integer|null,
  ""SuggestedInterviewDate"": string|null,
  ""AiReasoning"": string,
  ""ActionUrl"": string|null,
  ""ExtraNotes"": string|null
}";

        var userPrompt = $"Today's date: {DateTime.UtcNow:yyyy-MM-dd} ({DateTime.UtcNow.DayOfWeek})\n\nSubject: {subject}\n\nBody: {plainTextBody}";
        // 2. Build the request payload for Gemini
        var requestBody = new
        {
            systemInstruction = new { parts = new[] { new { text = systemPrompt } } },
            contents = new[] { new { parts = new[] { new { text = userPrompt } } } },
            generationConfig = new { temperature = 0.1, responseMimeType = "application/json" }
        };
        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var content = new StringContent(JsonSerializer.Serialize(requestBody, jsonOptions), Encoding.UTF8, "application/json");
        Console.WriteLine("\n=== DEBUG: TEXT SENT TO GEMINI ===");
        Console.WriteLine(userPrompt);
        Console.WriteLine("==================================\n");
        try
        {
            // 3. Call the AI
            var response = await _httpClient.PostAsync(endpoint, content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"=== GEMINI API ERROR ({(int)response.StatusCode}) ===\n{error}");
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
            Console.WriteLine($"=== GEMINI RAW OUTPUT ===\n{aiTextResponse}");


            return result ?? new ParsedEmailResult { IsJobRelated = false };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to parse email with AI: {ex.Message}");
            return new ParsedEmailResult { IsJobRelated = false, AiReasoning = "Failed to parse email." };
        }
    }
}