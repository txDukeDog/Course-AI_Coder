using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using KanbanApi.Data;
using KanbanApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
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

var dbPath = builder.Configuration["Database:Path"] ?? "kanban.db";
builder.Services.AddDbContext<KanbanDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<KanbanDbContext>();
    await db.Database.MigrateAsync();
    if (!await db.Users.AnyAsync())
        await SeedAsync(db);
}

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

app.MapPut("/api/columns/{id:int}", async (int id, RenameColumnRequest req, ClaimsPrincipal user, KanbanDbContext db) =>
{
    var username = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var col = await db.Columns
        .Where(c => c.Id == id && c.Board.User.Username == username)
        .FirstOrDefaultAsync();
    if (col == null) return Results.NotFound();

    col.Name = req.Name;
    await db.SaveChangesAsync();
    return Results.Ok(new { id = col.Id, name = col.Name });
}).RequireAuthorization();

app.MapPost("/api/cards", async (CreateCardRequest req, ClaimsPrincipal user, KanbanDbContext db) =>
{
    var username = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var col = await db.Columns
        .Include(c => c.Cards)
        .Where(c => c.Id == req.ColumnId && c.Board.User.Username == username)
        .FirstOrDefaultAsync();
    if (col == null) return Results.NotFound();

    var position = col.Cards.Count == 0 ? 0 : col.Cards.Max(c => c.Position) + 1;
    var card = new Card { ColumnId = req.ColumnId, Title = req.Title, Details = req.Details, Position = position };
    db.Cards.Add(card);
    await db.SaveChangesAsync();
    return Results.Created($"/api/cards/{card.Id}", new
    {
        id = card.Id,
        title = card.Title,
        details = card.Details,
        position = card.Position
    });
}).RequireAuthorization();

app.MapPut("/api/cards/{id:int}", async (int id, UpdateCardRequest req, ClaimsPrincipal user, KanbanDbContext db) =>
{
    var username = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var card = await db.Cards
        .Where(c => c.Id == id && c.Column.Board.User.Username == username)
        .FirstOrDefaultAsync();
    if (card == null) return Results.NotFound();

    card.Title = req.Title;
    card.Details = req.Details;
    card.ColumnId = req.ColumnId;
    card.Position = req.Position;
    await db.SaveChangesAsync();
    return Results.Ok(new
    {
        id = card.Id,
        title = card.Title,
        details = card.Details,
        columnId = card.ColumnId,
        position = card.Position
    });
}).RequireAuthorization();

app.MapDelete("/api/cards/{id:int}", async (int id, ClaimsPrincipal user, KanbanDbContext db) =>
{
    var username = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var card = await db.Cards
        .Where(c => c.Id == id && c.Column.Board.User.Username == username)
        .FirstOrDefaultAsync();
    if (card == null) return Results.NotFound();

    db.Cards.Remove(card);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

app.MapGet("/api/boards", async (ClaimsPrincipal user, KanbanDbContext db) =>
{
    var username = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var dbUser = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
    if (dbUser == null) return Results.NotFound();

    var boards = await db.Boards
        .Where(b => b.UserId == dbUser.Id)
        .OrderBy(b => b.Id)
        .Select(b => new { id = b.Id, name = b.Name })
        .ToListAsync();
    return Results.Ok(boards);
}).RequireAuthorization();

app.MapGet("/api/boards/{id:int}", async (int id, ClaimsPrincipal user, KanbanDbContext db) =>
{
    var username = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var board = await db.Boards
        .Include(b => b.Columns.OrderBy(c => c.Position))
            .ThenInclude(c => c.Cards.OrderBy(card => card.Position))
        .Where(b => b.Id == id && b.User.Username == username)
        .FirstOrDefaultAsync();
    if (board == null) return Results.NotFound();

    return Results.Ok(new
    {
        id = board.Id,
        name = board.Name,
        columns = board.Columns.Select(col => new
        {
            id = col.Id,
            name = col.Name,
            position = col.Position,
            cards = col.Cards.Select(card => new
            {
                id = card.Id,
                title = card.Title,
                details = card.Details,
                position = card.Position
            })
        })
    });
}).RequireAuthorization();

app.MapPost("/api/boards", async (CreateBoardRequest req, ClaimsPrincipal user, KanbanDbContext db) =>
{
    var username = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var dbUser = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
    if (dbUser == null) return Results.NotFound();

    var board = new Board { UserId = dbUser.Id, Name = req.Name };
    db.Boards.Add(board);
    await db.SaveChangesAsync();

    var columnNames = new[] { "Backlog", "Todo", "In Progress", "Review", "Done" };
    for (var i = 0; i < columnNames.Length; i++)
        db.Columns.Add(new Column { BoardId = board.Id, Name = columnNames[i], Position = i });
    await db.SaveChangesAsync();

    return Results.Created($"/api/boards/{board.Id}", new { id = board.Id, name = board.Name });
}).RequireAuthorization();

app.MapPut("/api/boards/{id:int}", async (int id, RenameBoardRequest req, ClaimsPrincipal user, KanbanDbContext db) =>
{
    var username = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var board = await db.Boards
        .Where(b => b.Id == id && b.User.Username == username)
        .FirstOrDefaultAsync();
    if (board == null) return Results.NotFound();

    board.Name = req.Name;
    await db.SaveChangesAsync();
    return Results.Ok(new { id = board.Id, name = board.Name });
}).RequireAuthorization();

app.MapDelete("/api/boards/{id:int}", async (int id, ClaimsPrincipal user, KanbanDbContext db) =>
{
    var username = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var board = await db.Boards
        .Include(b => b.Columns)
            .ThenInclude(c => c.Cards)
        .Where(b => b.Id == id && b.User.Username == username)
        .FirstOrDefaultAsync();
    if (board == null) return Results.NotFound();

    db.Boards.Remove(board);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

app.MapFallbackToFile("index.html");

app.Run();

static async Task SeedAsync(KanbanDbContext db)
{
    var user = new User
    {
        Username = "user",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("password")
    };
    db.Users.Add(user);
    await db.SaveChangesAsync();

    await CreateBoardWithDataAsync(db, user.Id, "My Project");
    await CreateBoardWithDataAsync(db, user.Id, "Design");
    await CreateBoardWithDataAsync(db, user.Id, "Operations");
    await CreateBoardWithDataAsync(db, user.Id, "Marketing");
}

static async Task CreateBoardWithDataAsync(KanbanDbContext db, int userId, string boardName)
{
    var board = new Board { UserId = userId, Name = boardName };
    db.Boards.Add(board);
    await db.SaveChangesAsync();

    var columnNames = new[] { "Backlog", "Todo", "In Progress", "Review", "Done" };
    for (var i = 0; i < columnNames.Length; i++)
    {
        var col = new Column { BoardId = board.Id, Name = columnNames[i], Position = i };
        db.Columns.Add(col);
        await db.SaveChangesAsync();

        db.Cards.AddRange(
            new Card { ColumnId = col.Id, Title = $"{boardName} - {columnNames[i]} task 1", Details = "Sample task", Position = 0 },
            new Card { ColumnId = col.Id, Title = $"{boardName} - {columnNames[i]} task 2", Details = "Sample task", Position = 1 }
        );
    }
    await db.SaveChangesAsync();
}

record LoginRequest(string Username, string Password);
record RenameColumnRequest(string Name);
record CreateBoardRequest(string Name);
record RenameBoardRequest(string Name);
record CreateCardRequest(int ColumnId, string Title, string Details);
record UpdateCardRequest(string Title, string Details, int ColumnId, int Position);

public partial class Program { }
