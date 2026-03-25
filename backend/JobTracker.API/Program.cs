using FluentValidation;
using JobTracker.API.Middleware;
using JobTracker.Application.Validators;
using JobTracker.Infrastructure;
using Microsoft.OpenApi;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();