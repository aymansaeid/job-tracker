using Amazon.Runtime;
using Amazon.S3;
using FluentValidation;
using JobTracker.API.Middleware;
using JobTracker.Application.Validators;
using JobTracker.Infrastructure;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.OpenApi;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// ── 1. CORE API SERVICES ──
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Forces all standard DateTime properties to serialize as UTC with trailing 'Z'
        options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter());
    });
builder.Services.AddEndpointsApiExplorer();

// ── 2. STRICT CORS POLICY ──
builder.Services.AddCors(options =>
{
    options.AddPolicy("StrictProductionPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",                 // Local React Vite development
                "https://jobtracker-sys.vercel.app" // Your live Vercel production domain
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Required for HttpOnly cookies or authenticated CORS
    });
});

// ── 3. PER-IP RATE LIMITING ──
builder.Services.AddRateLimiter(options =>
{
    // Standard Policy: Max 100 requests per minute PER IP ADDRESS
    options.AddPolicy("StandardPolicy", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? httpContext.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 2,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                Window = TimeSpan.FromMinutes(1)
            }));

    // Strict Auth Policy: Max 5 attempts per minute PER IP ADDRESS (Apply this to Login/Register endpoints)
    options.AddPolicy("AuthPolicy", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? httpContext.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 5,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// ── 4. SWAGGER / OPENAPI WITH JWT BEARER AUTH ──
builder.Services.AddSwaggerGen(options =>
{
    const string schemeId = "bearer";

    options.SwaggerDoc("v1", new OpenApiInfo { Title = "JobTracker API", Version = "v1" });

    options.AddSecurityDefinition(schemeId, new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste only your valid JWT token below."
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference(schemeId, document)] = []
    });
});

// ── 5. CLOUDFLARE R2 OBJECT STORAGE ──
var r2Config = builder.Configuration.GetSection("CloudflareR2");
var credentials = new BasicAWSCredentials(r2Config["AccessKey"], r2Config["SecretKey"]);
var s3Config = new AmazonS3Config
{
    ServiceURL = $"https://{r2Config["AccountId"]}.r2.cloudflarestorage.com"
};
builder.Services.AddSingleton<IAmazonS3>(new AmazonS3Client(credentials, s3Config));

// ── 6. ARCHITECTURAL DEPENDENCIES & ERROR HANDLING ──
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateUserRequestValidator>();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// ── 7. EXCEPTION HANDLING & CLOUD PROXY CONFIGURATION ──
app.UseExceptionHandler();

// CRITICAL FOR RAILWAY / CLOUD DEPLOYMENTS:
// Tells ASP.NET Core to read the real client IP from the X-Forwarded-For header sent by the cloud load balancer.
// Without this, rate limiting will block all users thinking they are coming from the same proxy IP.
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// ── 8. ENVIRONMENT & STATIC FILES ──
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseStaticFiles();

// ── 9. MIDDLEWARE PIPELINE (STRICT EXECUTION ORDER) ──
app.UseCors("StrictProductionPolicy");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// ── 10. ENDPOINT MAPPING ──
// Apply the 100 req/min StandardPolicy to all endpoints by default.
// Use [EnableRateLimiting("AuthPolicy")] on your AuthController's Login/Register methods to override this!
app.MapControllers().RequireRateLimiting("StandardPolicy");

app.Run();

// ── 11. CUSTOM UTC JSON CONVERTER ──
public class UtcDateTimeConverter : System.Text.Json.Serialization.JsonConverter<DateTime>
{
    public override DateTime Read(ref System.Text.Json.Utf8JsonReader reader, Type typeToConvert, System.Text.Json.JsonSerializerOptions options)
    {
        return reader.GetDateTime().ToUniversalTime();
    }

    public override void Write(System.Text.Json.Utf8JsonWriter writer, DateTime value, System.Text.Json.JsonSerializerOptions options)
    {
        // If EF Core returns Unspecified, explicitly treat it as UTC. Otherwise, convert to Universal Time.
        var utcDateTime = value.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(value, DateTimeKind.Utc)
            : value.ToUniversalTime();

        // The trailing 'Z' forces React/JavaScript to automatically convert to the user's local timezone (e.g., UTC+3 Istanbul)
        writer.WriteStringValue(utcDateTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
    }
}