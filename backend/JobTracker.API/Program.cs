using Amazon.Runtime;
using Amazon.S3;
using FluentValidation;
using JobTracker.API.Middleware;
using JobTracker.Application.Validators;
using JobTracker.Infrastructure;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.OpenApi;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// STRICT CORS 
builder.Services.AddCors(options =>
{
    options.AddPolicy("StrictProductionPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", // Keep local dev working
                "https://your-vercel-app-url.vercel.app" 
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Required if you ever use HttpOnly cookies
    });
});

//  RATE LIMITING 
builder.Services.AddRateLimiter(options =>
{
    // A standard policy: Max 100 requests per minute per IP address
    options.AddFixedWindowLimiter("StandardPolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 100;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 2; // Allow 2 requests to wait in line if they exceed the limit
    });

    // A strict policy for Login/Register: Max 5 attempts per minute
    options.AddFixedWindowLimiter("AuthPolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 5;
    });
});

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
        Description = "Paste only the JWT token"
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference(schemeId, document)] = []
    });
});

// ── CLOUDFLARE R2 SETUP ──
var r2Config = builder.Configuration.GetSection("CloudflareR2");
var credentials = new BasicAWSCredentials(r2Config["AccessKey"], r2Config["SecretKey"]);
var s3Config = new AmazonS3Config { ServiceURL = $"https://{r2Config["AccountId"]}.r2.cloudflarestorage.com" };
builder.Services.AddSingleton<IAmazonS3>(new AmazonS3Client(credentials, s3Config));

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateUserRequestValidator>();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// APPLY MIDDLEWARE 
app.UseCors("StrictProductionPolicy"); 
app.UseRateLimiter();                  
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers().RequireRateLimiting("StandardPolicy"); // Apply standard 100 req/min everywhere by default

app.Run();