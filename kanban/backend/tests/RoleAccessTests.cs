using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace KanbanApi.Tests;

public class RoleAccessTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public RoleAccessTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private static StringContent Json(object obj) =>
        new(JsonSerializer.Serialize(obj), Encoding.UTF8, "application/json");

    private async Task<(HttpClient client, string token)> LoginAs(string username, string password)
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsync("/api/auth/login", Json(new { username, password }));
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var token = JsonDocument.Parse(await res.Content.ReadAsStringAsync())
            .RootElement.GetProperty("token").GetString()!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return (client, token);
    }

    private static string? GetTokenClaim(string token, string claimType)
    {
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        return jwt.Claims.FirstOrDefault(c => c.Type == claimType)?.Value;
    }

    private static async Task<List<JsonElement>> GetBoards(HttpClient client)
    {
        var res = await client.GetAsync("/api/boards");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        return JsonDocument.Parse(await res.Content.ReadAsStringAsync()).RootElement.EnumerateArray().ToList();
    }

    // --- login produces correct claims ---

    [Fact]
    public async Task Login_Admin_TokenContainsAdminRole()
    {
        var (_, token) = await LoginAs("admin", "admin123");
        Assert.Equal("admin", GetTokenClaim(token, "role"));
    }

    [Fact]
    public async Task Login_Manager_TokenContainsManagerRoleAndOrgId()
    {
        var (_, token) = await LoginAs("manager_a", "manager123");
        Assert.Equal("manager", GetTokenClaim(token, "role"));
        Assert.NotNull(GetTokenClaim(token, "org_id"));
    }

    [Fact]
    public async Task Login_User_TokenContainsUserRole()
    {
        var (_, token) = await LoginAs("user", "password");
        Assert.Equal("user", GetTokenClaim(token, "role"));
    }

    [Fact]
    public async Task Login_UnknownUsername_Returns401()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsync("/api/auth/login", Json(new { username = "nobody", password = "x" }));
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsync("/api/auth/login", Json(new { username = "admin", password = "wrong" }));
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    // --- board visibility by role ---

    [Fact]
    public async Task Admin_CanSeeAllTenBoards()
    {
        var (client, _) = await LoginAs("admin", "admin123");
        var boards = await GetBoards(client);
        Assert.True(boards.Count >= 10);
    }

    [Fact]
    public async Task ManagerA_CanSeeOnlyAlphaBoards()
    {
        var (client, _) = await LoginAs("manager_a", "manager123");
        var boards = await GetBoards(client);
        Assert.Equal(3, boards.Count);
        Assert.All(boards, b => Assert.StartsWith("Alpha", b.GetProperty("name").GetString()));
    }

    [Fact]
    public async Task ManagerB_CanSeeOnlyBetaBoards()
    {
        var (client, _) = await LoginAs("manager_b", "manager123");
        var boards = await GetBoards(client);
        Assert.Equal(3, boards.Count);
        Assert.All(boards, b => Assert.StartsWith("Beta", b.GetProperty("name").GetString()));
    }

    [Fact]
    public async Task ManagerC_CanSeeOnlyGammaBoards()
    {
        var (client, _) = await LoginAs("manager_c", "manager123");
        var boards = await GetBoards(client);
        Assert.Equal(4, boards.Count);
        Assert.All(boards, b => Assert.StartsWith("Gamma", b.GetProperty("name").GetString()));
    }

    [Fact]
    public async Task User_CanSeeExactlyOneBoard()
    {
        var (client, _) = await LoginAs("user", "password");
        var boards = await GetBoards(client);
        Assert.Single(boards);
        Assert.Equal("Alpha - Engineering", boards[0].GetProperty("name").GetString());
    }

    [Fact]
    public async Task UserB1_CanSeeExactlyOneBoard_BetaProduct()
    {
        var (client, _) = await LoginAs("user_b1", "password");
        var boards = await GetBoards(client);
        Assert.Single(boards);
        Assert.Equal("Beta - Product", boards[0].GetProperty("name").GetString());
    }

    // --- cross-org access is blocked ---

    [Fact]
    public async Task UserB1_CannotAccessAlphaBoard()
    {
        // Get an Alpha board id via manager_a
        var (managerClient, _) = await LoginAs("manager_a", "manager123");
        var alphaBoards = await GetBoards(managerClient);
        var alphaBoardId = alphaBoards[0].GetProperty("id").GetInt32();

        // user_b1 (Beta org) tries to access it
        var (userClient, _) = await LoginAs("user_b1", "password");
        var res = await userClient.GetAsync($"/api/boards/{alphaBoardId}");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }

    [Fact]
    public async Task ManagerB_CannotAccessAlphaBoard()
    {
        var (managerAClient, _) = await LoginAs("manager_a", "manager123");
        var alphaBoards = await GetBoards(managerAClient);
        var alphaBoardId = alphaBoards[0].GetProperty("id").GetInt32();

        var (managerBClient, _) = await LoginAs("manager_b", "manager123");
        var res = await managerBClient.GetAsync($"/api/boards/{alphaBoardId}");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }
}
