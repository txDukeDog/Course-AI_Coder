using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace KanbanApi.Tests;

public class BoardApiTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly HttpClient _anonClient;

    public BoardApiTests(TestWebApplicationFactory factory)
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

    private async Task<JsonElement> GetBoardAsync()
    {
        var res = await _client.GetAsync("/api/board");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        return JsonDocument.Parse(await res.Content.ReadAsStringAsync()).RootElement;
    }

    [Fact]
    public async Task GetBoard_ReturnsSeededStructure()
    {
        var board = await GetBoardAsync();
        var columns = board.GetProperty("columns").EnumerateArray().ToList();
        Assert.Equal(5, columns.Count);
        foreach (var col in columns)
            Assert.True(col.GetProperty("cards").GetArrayLength() >= 2);
    }

    [Fact]
    public async Task PostCard_CreatesCardWithId()
    {
        var board = await GetBoardAsync();
        var colId = board.GetProperty("columns")[0].GetProperty("id").GetInt32();

        var res = await _client.PostAsync("/api/cards",
            Json(new { columnId = colId, title = "New Test Card", details = "Test details" }));

        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var card = JsonDocument.Parse(await res.Content.ReadAsStringAsync()).RootElement;
        Assert.True(card.GetProperty("id").GetInt32() > 0);
        Assert.Equal("New Test Card", card.GetProperty("title").GetString());
    }

    [Fact]
    public async Task PutCard_UpdatesCard()
    {
        var board = await GetBoardAsync();
        var firstCol = board.GetProperty("columns")[0];
        var cardId = firstCol.GetProperty("cards")[0].GetProperty("id").GetInt32();
        var colId = firstCol.GetProperty("id").GetInt32();

        var res = await _client.PutAsync($"/api/cards/{cardId}",
            Json(new { title = "Updated Title", details = "Updated details", columnId = colId, position = 0 }));

        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var updated = JsonDocument.Parse(await res.Content.ReadAsStringAsync()).RootElement;
        Assert.Equal("Updated Title", updated.GetProperty("title").GetString());
    }

    [Fact]
    public async Task DeleteCard_RemovesCard()
    {
        var board = await GetBoardAsync();
        var colId = board.GetProperty("columns")[0].GetProperty("id").GetInt32();

        var createRes = await _client.PostAsync("/api/cards",
            Json(new { columnId = colId, title = "Card To Delete", details = "" }));
        var cardId = JsonDocument.Parse(await createRes.Content.ReadAsStringAsync())
            .RootElement.GetProperty("id").GetInt32();

        var deleteRes = await _client.DeleteAsync($"/api/cards/{cardId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteRes.StatusCode);

        var afterBoard = await GetBoardAsync();
        var allCardIds = afterBoard.GetProperty("columns").EnumerateArray()
            .SelectMany(col => col.GetProperty("cards").EnumerateArray())
            .Select(c => c.GetProperty("id").GetInt32());
        Assert.DoesNotContain(cardId, allCardIds);
    }

    [Fact]
    public async Task PutColumn_RenamesColumn()
    {
        var board = await GetBoardAsync();
        var colId = board.GetProperty("columns")[0].GetProperty("id").GetInt32();

        var res = await _client.PutAsync($"/api/columns/{colId}",
            Json(new { name = "Renamed Column" }));

        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var afterBoard = await GetBoardAsync();
        var col = afterBoard.GetProperty("columns").EnumerateArray()
            .First(c => c.GetProperty("id").GetInt32() == colId);
        Assert.Equal("Renamed Column", col.GetProperty("name").GetString());
    }

    [Theory]
    [InlineData("GET", "/api/board", null)]
    [InlineData("POST", "/api/cards", """{"columnId":1,"title":"x","details":""}""")]
    [InlineData("PUT", "/api/columns/1", """{"name":"x"}""")]
    [InlineData("PUT", "/api/cards/1", """{"title":"x","details":"","columnId":1,"position":0}""")]
    [InlineData("DELETE", "/api/cards/1", null)]
    public async Task Endpoints_WithoutJwt_Return401(string method, string url, string? body)
    {
        var req = new HttpRequestMessage(new HttpMethod(method), url);
        if (body != null)
            req.Content = new StringContent(body, Encoding.UTF8, "application/json");

        var res = await _anonClient.SendAsync(req);
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }
}
