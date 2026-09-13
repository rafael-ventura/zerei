using Zerei.Application.Services;
using Zerei.Domain.Entities;
using Xunit;

namespace Zerei.Tests.Application.Services;

public class SeguidorServiceTests
{
    private static async Task<Usuario> SeedUsuarioAsync(Zerei.Infrastructure.Data.ZereiDbContext db, string username)
    {
        var usuario = new Usuario { Nome = username, Username = username, Email = $"{username}@zerei.app", SenhaHash = "x" };
        db.Usuarios.Add(usuario);
        await db.SaveChangesAsync();
        return usuario;
    }

    [Fact]
    public async Task SeguirAsync_CreatesRelationship()
    {
        var db = TestDb.New();
        var a = await SeedUsuarioAsync(db, "a");
        var b = await SeedUsuarioAsync(db, "b");
        var service = new SeguidorService(db);

        await service.SeguirAsync(a.Id, b.Id);

        Assert.True(await service.SegueAsync(a.Id, b.Id));
    }

    [Fact]
    public async Task SeguirAsync_Twice_DoesNotDuplicate()
    {
        var db = TestDb.New();
        var a = await SeedUsuarioAsync(db, "a");
        var b = await SeedUsuarioAsync(db, "b");
        var service = new SeguidorService(db);

        await service.SeguirAsync(a.Id, b.Id);
        await service.SeguirAsync(a.Id, b.Id);

        Assert.Single(db.Seguidores);
    }

    [Fact]
    public async Task SeguirAsync_Self_Throws()
    {
        var db = TestDb.New();
        var a = await SeedUsuarioAsync(db, "a");
        var service = new SeguidorService(db);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.SeguirAsync(a.Id, a.Id));
    }

    [Fact]
    public async Task SeguirAsync_UnknownUser_Throws()
    {
        var db = TestDb.New();
        var a = await SeedUsuarioAsync(db, "a");
        var service = new SeguidorService(db);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.SeguirAsync(a.Id, seguidoId: 999));
    }

    [Fact]
    public async Task DeixarDeSeguirAsync_RemovesRelationship()
    {
        var db = TestDb.New();
        var a = await SeedUsuarioAsync(db, "a");
        var b = await SeedUsuarioAsync(db, "b");
        var service = new SeguidorService(db);
        await service.SeguirAsync(a.Id, b.Id);

        await service.DeixarDeSeguirAsync(a.Id, b.Id);

        Assert.False(await service.SegueAsync(a.Id, b.Id));
    }

    [Fact]
    public async Task SeguidoresAsync_And_SeguindoAsync_ReturnCorrectLists()
    {
        var db = TestDb.New();
        var a = await SeedUsuarioAsync(db, "a");
        var b = await SeedUsuarioAsync(db, "b");
        var c = await SeedUsuarioAsync(db, "c");
        var service = new SeguidorService(db);
        await service.SeguirAsync(a.Id, b.Id); // a segue b
        await service.SeguirAsync(c.Id, b.Id); // c segue b

        var seguidoresDeB = await service.SeguidoresAsync(b.Id);
        var seguindoDeA = await service.SeguindoAsync(a.Id);

        Assert.Equal(2, seguidoresDeB.Count);
        Assert.Contains(seguidoresDeB, u => u.Username == "a");
        Assert.Contains(seguidoresDeB, u => u.Username == "c");
        Assert.Single(seguindoDeA);
        Assert.Equal("b", seguindoDeA[0].Username);
    }
}
