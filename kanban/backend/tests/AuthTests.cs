using System.Net;
using System.Text;
using System.Text.Json;
namespace KanbanApi.Tests;

public class AuthTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private static StringContent Json(object obj) =>
        new(JsonSerializer.Serialize(obj), Encoding.UTF8, "application/json");

    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        var response = await _client.PostAsync("/api/auth/login",
            Json(new { username = "user", password = "password" }));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(body);
        Assert.True(doc.RootElement.TryGetProperty("token", out var token));
        Assert.False(string.IsNullOrEmpty(token.GetString()));
    }

    [Fact]
    public async Task Login_InvalidCredentials_Returns401()
    {
        var response = await _client.PostAsync("/api/auth/login",
            Json(new { username = "wrong", password = "wrong" }));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_Returns200()
    {
        var response = await _client.PostAsync("/api/auth/logout", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Board_WithoutJwt_Returns401()
    {
        var response = await _client.GetAsync("/api/boards");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
