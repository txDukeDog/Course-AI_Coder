using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace KanbanApi.Data;

public class KanbanDbContextFactory : IDesignTimeDbContextFactory<KanbanDbContext>
{
    public KanbanDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<KanbanDbContext>()
            .UseSqlite("Data Source=kanban.db")
            .Options;
        return new KanbanDbContext(options);
    }
}
