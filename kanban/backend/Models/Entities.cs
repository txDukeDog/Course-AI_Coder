namespace KanbanApi.Models;

public class Organization
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public ICollection<User> Users { get; set; } = [];
    public ICollection<Board> Boards { get; set; } = [];
}

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "user";
    public int? OrgId { get; set; }
    public Organization? Org { get; set; }
    public ICollection<Board> Boards { get; set; } = [];
    public ICollection<UserBoardAccess> BoardAccess { get; set; } = [];
}

public class UserBoardAccess
{
    public int UserId { get; set; }
    public int BoardId { get; set; }
    public User User { get; set; } = null!;
    public Board Board { get; set; } = null!;
}

public class Board
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = "";
    public int? OrgId { get; set; }
    public User User { get; set; } = null!;
    public Organization? Org { get; set; }
    public ICollection<Column> Columns { get; set; } = [];
    public ICollection<UserBoardAccess> UserBoardAccess { get; set; } = [];
}

public class Column
{
    public int Id { get; set; }
    public int BoardId { get; set; }
    public string Name { get; set; } = "";
    public int Position { get; set; }
    public Board Board { get; set; } = null!;
    public ICollection<Card> Cards { get; set; } = [];
}

public class Card
{
    public int Id { get; set; }
    public int ColumnId { get; set; }
    public string Title { get; set; } = "";
    public string Details { get; set; } = "";
    public int Position { get; set; }
    public Column Column { get; set; } = null!;
}
