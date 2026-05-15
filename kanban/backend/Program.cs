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

app.MapPost("/api/auth/login", async (LoginRequest req, KanbanDbContext db) =>
{
    var dbUser = await db.Users.FirstOrDefaultAsync(u => u.Username == req.Username);
    if (dbUser == null || !BCrypt.Net.BCrypt.Verify(req.Password, dbUser.PasswordHash))
        return Results.Unauthorized();

    var claims = new List<Claim>
    {
        new Claim(JwtRegisteredClaimNames.Sub, dbUser.Username),
        new Claim("role", dbUser.Role),
    };
    if (dbUser.OrgId.HasValue)
        claims.Add(new Claim("org_id", dbUser.OrgId.Value.ToString()));

    var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken(
        claims: claims,
        expires: DateTime.UtcNow.AddHours(8),
        signingCredentials: creds
    );
    return Results.Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
});

app.MapPost("/api/auth/logout", () => Results.Ok());

app.MapGet("/api/boards", async (ClaimsPrincipal user, KanbanDbContext db) =>
{
    var dbUser = await GetDbUser(user, db);
    if (dbUser == null) return Results.NotFound();

    var boards = await FilterBoards(db.Boards, user, dbUser.Id)
        .OrderBy(b => b.Id)
        .Select(b => new { id = b.Id, name = b.Name })
        .ToListAsync();
    return Results.Ok(boards);
}).RequireAuthorization();

app.MapGet("/api/boards/{id:int}", async (int id, ClaimsPrincipal user, KanbanDbContext db) =>
{
    var dbUser = await GetDbUser(user, db);
    if (dbUser == null) return Results.NotFound();

    var board = await FilterBoards(
            db.Boards
              .Include(b => b.Columns.OrderBy(c => c.Position))
                .ThenInclude(c => c.Cards.OrderBy(card => card.Position)),
            user, dbUser.Id)
        .FirstOrDefaultAsync(b => b.Id == id);
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
    var dbUser = await GetDbUser(user, db);
    if (dbUser == null) return Results.NotFound();

    var board = new Board { UserId = dbUser.Id, Name = req.Name, OrgId = dbUser.OrgId };
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
    var dbUser = await GetDbUser(user, db);
    if (dbUser == null) return Results.NotFound();

    var board = await FilterBoards(db.Boards, user, dbUser.Id)
        .FirstOrDefaultAsync(b => b.Id == id);
    if (board == null) return Results.NotFound();

    board.Name = req.Name;
    await db.SaveChangesAsync();
    return Results.Ok(new { id = board.Id, name = board.Name });
}).RequireAuthorization();

app.MapDelete("/api/boards/{id:int}", async (int id, ClaimsPrincipal user, KanbanDbContext db) =>
{
    var dbUser = await GetDbUser(user, db);
    if (dbUser == null) return Results.NotFound();

    var board = await FilterBoards(
            db.Boards.Include(b => b.Columns).ThenInclude(c => c.Cards),
            user, dbUser.Id)
        .FirstOrDefaultAsync(b => b.Id == id);
    if (board == null) return Results.NotFound();

    db.Boards.Remove(board);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

app.MapPut("/api/columns/{id:int}", async (int id, RenameColumnRequest req, ClaimsPrincipal user, KanbanDbContext db) =>
{
    var dbUser = await GetDbUser(user, db);
    if (dbUser == null) return Results.NotFound();

    var col = await FilterColumns(db.Columns, user, dbUser.Id)
        .FirstOrDefaultAsync(c => c.Id == id);
    if (col == null) return Results.NotFound();

    col.Name = req.Name;
    await db.SaveChangesAsync();
    return Results.Ok(new { id = col.Id, name = col.Name });
}).RequireAuthorization();

app.MapPost("/api/cards", async (CreateCardRequest req, ClaimsPrincipal user, KanbanDbContext db) =>
{
    var dbUser = await GetDbUser(user, db);
    if (dbUser == null) return Results.NotFound();

    var col = await FilterColumns(db.Columns.Include(c => c.Cards), user, dbUser.Id)
        .FirstOrDefaultAsync(c => c.Id == req.ColumnId);
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
    var dbUser = await GetDbUser(user, db);
    if (dbUser == null) return Results.NotFound();

    var card = await FilterCards(db.Cards, user, dbUser.Id)
        .FirstOrDefaultAsync(c => c.Id == id);
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
    var dbUser = await GetDbUser(user, db);
    if (dbUser == null) return Results.NotFound();

    var card = await FilterCards(db.Cards, user, dbUser.Id)
        .FirstOrDefaultAsync(c => c.Id == id);
    if (card == null) return Results.NotFound();

    db.Cards.Remove(card);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

app.MapFallbackToFile("index.html");

app.Run();

// --- helpers ---

static async Task<User?> GetDbUser(ClaimsPrincipal principal, KanbanDbContext db)
{
    var username = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    return await db.Users.FirstOrDefaultAsync(u => u.Username == username);
}

static (string role, int? orgId) GetRoleClaims(ClaimsPrincipal principal)
{
    var role = principal.FindFirst(ClaimTypes.Role)?.Value ?? "user";
    var orgIdStr = principal.FindFirst("org_id")?.Value;
    return (role, orgIdStr != null ? int.Parse(orgIdStr) : null);
}

static IQueryable<Board> FilterBoards(IQueryable<Board> query, ClaimsPrincipal principal, int userId)
{
    var (role, orgId) = GetRoleClaims(principal);
    if (role == "admin") return query;
    if (role == "manager") return orgId.HasValue
        ? query.Where(b => b.OrgId == orgId)
        : query.Where(_ => false);
    return query.Where(b => b.UserBoardAccess.Any(a => a.UserId == userId));
}

static IQueryable<Column> FilterColumns(IQueryable<Column> query, ClaimsPrincipal principal, int userId)
{
    var (role, orgId) = GetRoleClaims(principal);
    if (role == "admin") return query;
    if (role == "manager") return orgId.HasValue
        ? query.Where(c => c.Board.OrgId == orgId)
        : query.Where(_ => false);
    return query.Where(c => c.Board.UserBoardAccess.Any(a => a.UserId == userId));
}

static IQueryable<Card> FilterCards(IQueryable<Card> query, ClaimsPrincipal principal, int userId)
{
    var (role, orgId) = GetRoleClaims(principal);
    if (role == "admin") return query;
    if (role == "manager") return orgId.HasValue
        ? query.Where(c => c.Column.Board.OrgId == orgId)
        : query.Where(_ => false);
    return query.Where(c => c.Column.Board.UserBoardAccess.Any(a => a.UserId == userId));
}

// --- seed ---

static async Task SeedAsync(KanbanDbContext db)
{
    // Organizations
    var alpha = new Organization { Name = "Alpha Corp" };
    var beta  = new Organization { Name = "Beta Inc" };
    var gamma = new Organization { Name = "Gamma Ltd" };
    db.Organizations.AddRange(alpha, beta, gamma);
    await db.SaveChangesAsync();

    // Users
    var admin    = new User { Username = "admin",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),   Role = "admin"   };
    var managerA = new User { Username = "manager_a", PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager123"), Role = "manager", OrgId = alpha.Id };
    var managerB = new User { Username = "manager_b", PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager123"), Role = "manager", OrgId = beta.Id };
    var managerC = new User { Username = "manager_c", PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager123"), Role = "manager", OrgId = gamma.Id };
    var user     = new User { Username = "user",      PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),   Role = "user",    OrgId = alpha.Id };
    var userA2   = new User { Username = "user_a2",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),   Role = "user",    OrgId = alpha.Id };
    var userB1   = new User { Username = "user_b1",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),   Role = "user",    OrgId = beta.Id };
    var userB2   = new User { Username = "user_b2",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),   Role = "user",    OrgId = beta.Id };
    var userC1   = new User { Username = "user_c1",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),   Role = "user",    OrgId = gamma.Id };
    var userC2   = new User { Username = "user_c2",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),   Role = "user",    OrgId = gamma.Id };
    db.Users.AddRange(admin, managerA, managerB, managerC, user, userA2, userB1, userB2, userC1, userC2);
    await db.SaveChangesAsync();

    // Boards — 3 Alpha, 3 Beta, 4 Gamma
    var boardData = new[]
    {
        (Name: "Alpha - Engineering", Owner: managerA, Org: alpha, AccessUser: user),
        (Name: "Alpha - Design",      Owner: managerA, Org: alpha, AccessUser: userA2),
        (Name: "Alpha - Marketing",   Owner: managerA, Org: alpha, AccessUser: (User?)null),
        (Name: "Beta - Product",      Owner: managerB, Org: beta,  AccessUser: userB1),
        (Name: "Beta - Operations",   Owner: managerB, Org: beta,  AccessUser: userB2),
        (Name: "Beta - Support",      Owner: managerB, Org: beta,  AccessUser: (User?)null),
        (Name: "Gamma - Research",    Owner: managerC, Org: gamma, AccessUser: userC1),
        (Name: "Gamma - Sales",       Owner: managerC, Org: gamma, AccessUser: userC2),
        (Name: "Gamma - Finance",     Owner: managerC, Org: gamma, AccessUser: (User?)null),
        (Name: "Gamma - HR",          Owner: managerC, Org: gamma, AccessUser: (User?)null),
    };

    foreach (var (name, owner, org, accessUser) in boardData)
        await CreateBoardWithDataAsync(db, owner.Id, org.Id, name, accessUser?.Id);
}

static async Task CreateBoardWithDataAsync(KanbanDbContext db, int userId, int orgId, string boardName, int? accessUserId)
{
    var board = new Board { UserId = userId, OrgId = orgId, Name = boardName };
    db.Boards.Add(board);
    await db.SaveChangesAsync();

    if (accessUserId.HasValue)
        db.UserBoardAccess.Add(new UserBoardAccess { UserId = accessUserId.Value, BoardId = board.Id });

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
