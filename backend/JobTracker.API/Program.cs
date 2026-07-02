using Amazon.Runtime;
using Amazon.S3;
using FluentValidation;
using JobTracker.API.Middleware;
using JobTracker.Application.Validators;
using JobTracker.Infrastructure;
using Microsoft.OpenApi; 

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddSwaggerGen(options =>
{
    const string schemeId = "bearer";

    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "JobTracker API",
        Version = "v1"
    });

   
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

//  CLOUDFLARE R2 SETUP 
var r2Config = builder.Configuration.GetSection("CloudflareR2");
var credentials = new BasicAWSCredentials(r2Config["AccessKey"], r2Config["SecretKey"]);

var s3Config = new AmazonS3Config
{
    // Points the official AWS SDK directly to Cloudflare's servers
    ServiceURL = $"https://{r2Config["AccountId"]}.r2.cloudflarestorage.com",
};

// Register the S3 Client as a Singleton so your DocumentService can use it
builder.Services.AddSingleton<IAmazonS3>(new AmazonS3Client(credentials, s3Config));
// ──────────────────────────────

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
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();