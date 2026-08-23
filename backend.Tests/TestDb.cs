using Microsoft.EntityFrameworkCore;
using Zerei.Infrastructure.Data;

namespace Zerei.Tests;

internal static class TestDb
{
    public static ZereiDbContext New() =>
        new(new DbContextOptionsBuilder<ZereiDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);
}
