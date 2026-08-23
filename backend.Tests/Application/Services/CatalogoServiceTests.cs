using Microsoft.Extensions.Logging.Abstractions;
using Zerei.Application.Services;
using Zerei.Domain.Entities;
using Zerei.Infrastructure.External;
using Xunit;

namespace Zerei.Tests.Application.Services;

public class CatalogoServiceTests
{
    // Configurado == false whenever no ApiKey is set, so these exercise the
    // "local catalog only" path without any HTTP call ever happening.
    private static RawgService UnconfiguredRawg() =>
        new(new HttpClient(), new RawgOptions { ApiKey = null }, NullLogger<RawgService>.Instance);

    // BuscarAsync's local-catalog query uses EF.Functions.ILike, which is a Postgres-specific
    // translation (Npgsql) with no InMemory/SQLite equivalent — it throws on any non-Npgsql
    // provider regardless of the data or search term. Covering that path needs a real Postgres
    // connection (integration test), not a unit test, so it's intentionally left untested here.

    [Fact]
    public async Task FamososAsync_FiltersByGenreSlugWhenGiven()
    {
        var db = TestDb.New();
        var rpg = new Genero { Nome = "RPG", Slug = "rpg" };
        var acao = new Genero { Nome = "Ação", Slug = "acao" };
        db.Generos.AddRange(rpg, acao);
        db.Jogos.AddRange(
            new Jogo { Nome = "Chrono Trigger", Famoso = true, Generos = { rpg } },
            new Jogo { Nome = "Doom", Famoso = true, Generos = { acao } },
            new Jogo { Nome = "Jogo Escondido", Famoso = false, Generos = { rpg } });
        await db.SaveChangesAsync();
        var service = new CatalogoService(db, UnconfiguredRawg());

        var apenasRpg = await service.FamososAsync("rpg");

        Assert.Single(apenasRpg);
        Assert.Equal("Chrono Trigger", apenasRpg[0].Nome);
    }

    [Fact]
    public async Task PorIdAsync_UnknownId_ReturnsNull()
    {
        var db = TestDb.New();
        var service = new CatalogoService(db, UnconfiguredRawg());

        var result = await service.PorIdAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task EnriquecerCapasAsync_RawgNotConfigured_ReturnsZeroAndTouchesNothing()
    {
        var db = TestDb.New();
        db.Jogos.Add(new Jogo { Nome = "Sem Capa" });
        await db.SaveChangesAsync();
        var service = new CatalogoService(db, UnconfiguredRawg());

        var atualizadas = await service.EnriquecerCapasAsync();

        Assert.Equal(0, atualizadas);
    }
}
