using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace KanbanApi.Tests;

public class MultiBoardApiTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly HttpClient _anonClient;

    public MultiBoardApiTests(TestWebApplicationFactory factory)
    {
        _anonClient = factory.CreateClient();
        _client = factory.CreateClient();

        var loginRes = _client.PostAsync("/api/auth/login",
            Json(new { username = "user", password = "password" })).GetAwaiter().GetResult();
        var body = loginRes.Content.ReadAsStringAsync().GetAwaiter().GetResult();
        var token = JsonDocument.Parse(body).RootElement.GetProperty("token").GetString()!;
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    private static StringContent Json(object obj) =>
        new(JsonSerializer.Serialize(obj), Encoding.UTF8, "application/json");

    private async Task<JsonElement> ParseJson(HttpResponseMessage res) =>
        JsonDocument.Parse(await res.Content.ReadAsStringAsync()).RootElement;

    [Fact]
    public async Task GetBoards_ReturnsAtLeastFourBoards()
    {
        var res = await _client.GetAsync("/api/boards");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var boards = (await ParseJson(res)).EnumerateArray().ToList();
        Assert.True(boards.Count >= 4);
        foreach (var b in boards)
        {
            Assert.True(b.GetProperty("id").GetInt32() > 0);
            Assert.False(string.IsNullOrEmpty(b.GetProperty("name").GetString()));
        }
    }

    [Fact]
    public async Task GetBoardById_ReturnsColumnsAndCards()
    {
        var boardsRes = await _client.GetAsync("/api/boards");
        var firstId = (await ParseJson(boardsRes)).EnumerateArray().First().GetProperty("id").GetInt32();

        var res = await _client.GetAsync($"/api/boards/{firstId}");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var board = await ParseJson(res);
        Assert.Equal(firstId, board.GetProperty("id").GetInt32());
        var columns = board.GetProperty("columns").EnumerateArray().ToList();
        Assert.Equal(5, columns.Count);
        foreach (var col in columns)
            Assert.True(col.GetProperty("cards").GetArrayLength() >= 2);
    }

    [Fact]
    public async Task GetBoardById_NonExistent_Returns404()
    {
        var res = await _client.GetAsync("/api/boards/99999");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }

    [Fact]
    public async Task PostBoard_CreatesWithFiveDefaultColumns()
    {
        var res = await _client.PostAsync("/api/boards", Json(new { name = "Test Board" }));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var created = await ParseJson(res);
        var newId = created.GetProperty("id").GetInt32();
        Assert.True(newId > 0);

        var detailRes = await _client.GetAsync($"/api/boards/{newId}");
        Assert.Equal(HttpStatusCode.OK, detailRes.StatusCode);
        var board = await ParseJson(detailRes);
        Assert.Equal(5, board.GetProperty("columns").GetArrayLength());
    }

    [Fact]
    public async Task PutBoard_RenamesBoard()
    {
        var boardsRes = await _client.GetAsync("/api/boards");
        var firstId = (await ParseJson(boardsRes)).EnumerateArray().First().GetProperty("id").GetInt32();

        var res = await _client.PutAsync($"/api/boards/{firstId}", Json(new { name = "Renamed Board" }));
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);

        var listRes = await _client.GetAsync("/api/boards");
        var names = (await ParseJson(listRes)).EnumerateArray()
            .Select(b => b.GetProperty("name").GetString()).ToList();
        Assert.Contains("Renamed Board", names);
    }

    [Fact]
    public async Task DeleteBoard_RemovesBoardAndChildren()
    {
        var createRes = await _client.PostAsync("/api/boards", Json(new { name = "Board To Delete" }));
        var newId = (await ParseJson(createRes)).GetProperty("id").GetInt32();

        var deleteRes = await _client.DeleteAsync($"/api/boards/{newId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteRes.StatusCode);

        var fetchRes = await _client.GetAsync($"/api/boards/{newId}");
        Assert.Equal(HttpStatusCode.NotFound, fetchRes.StatusCode);

        var listRes = await _client.GetAsync("/api/boards");
        var ids = (await ParseJson(listRes)).EnumerateArray()
            .Select(b => b.GetProperty("id").GetInt32()).ToList();
        Assert.DoesNotContain(newId, ids);
    }

    [Theory]
    [InlineData("GET", "/api/boards", null)]
    [InlineData("GET", "/api/boards/1", null)]
    [InlineData("POST", "/api/boards", """{"name":"x"}""")]
    [InlineData("PUT", "/api/boards/1", """{"name":"x"}""")]
    [InlineData("DELETE", "/api/boards/1", null)]
    public async Task BoardEndpoints_WithoutJwt_Return401(string method, string url, string? body)
    {
        var req = new HttpRequestMessage(new HttpMethod(method), url);
        if (body != null)
            req.Content = new StringContent(body, Encoding.UTF8, "application/json");

        var res = await _anonClient.SendAsync(req);
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }
}
