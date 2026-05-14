namespace KanbanApi.Tests;

public class EndpointTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public EndpointTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Health_ReturnsOkWithStatusOk()
    {
        var response = await _client.GetAsync("/api/health");

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("ok", body);
    }

    [Fact]
    public async Task Root_ReturnsHtmlContent()
    {
        var response = await _client.GetAsync("/");

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var contentType = response.Content.Headers.ContentType?.MediaType;
        Assert.Equal("text/html", contentType);
    }
}
