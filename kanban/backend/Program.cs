using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is not configured");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateIssuer = false,
            ValidateAudience = false,
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

var env = app.Environment;
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? "/";
    if (!Path.HasExtension(path) && path != "/")
    {
        var htmlFile = env.WebRootFileProvider.GetFileInfo(path.TrimEnd('/') + ".html");
        if (htmlFile.Exists)
            context.Request.Path = path.TrimEnd('/') + ".html";
    }
    await next();
});

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/api/auth/login", (LoginRequest req) =>
{
    if (req.Username != "user" || req.Password != "password")
        return Results.Unauthorized();

    var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken(
        claims: [new Claim(JwtRegisteredClaimNames.Sub, req.Username)],
        expires: DateTime.UtcNow.AddHours(8),
        signingCredentials: credentials
    );
    return Results.Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
});

app.MapPost("/api/auth/logout", () => Results.Ok());

app.MapGet("/api/board", () => Results.Ok()).RequireAuthorization();

app.MapFallbackToFile("index.html");

app.Run();

record LoginRequest(string Username, string Password);

public partial class Program { }
