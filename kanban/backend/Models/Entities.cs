namespace KanbanApi.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public ICollection<Board> Boards { get; set; } = [];
}

public class Board
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = "";
    public User User { get; set; } = null!;
    public ICollection<Column> Columns { get; set; } = [];
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
