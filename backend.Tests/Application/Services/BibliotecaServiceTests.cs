using Zerei.Application.Dtos;
using Zerei.Application.Services;
using Zerei.Domain.Entities;
using Zerei.Domain.Enums;
using Xunit;

namespace Zerei.Tests.Application.Services;

public class BibliotecaServiceTests
{
    private static async Task<Jogo> SeedJogoAsync(Zerei.Infrastructure.Data.ZereiDbContext db, string nome = "Chrono Trigger")
    {
        var jogo = new Jogo { Nome = nome, Ano = 1995, Famoso = true };
        db.Jogos.Add(jogo);
        await db.SaveChangesAsync();
        return jogo;
    }

    [Fact]
    public async Task MarcarAsync_NewGame_CreatesUsuarioJogo()
    {
        var db = TestDb.New();
        var jogo = await SeedJogoAsync(db);
        var service = new BibliotecaService(db);

        var result = await service.MarcarAsync(usuarioId: 1, jogo.Id, StatusJogo.QueroJogar);

        Assert.Equal(StatusJogo.QueroJogar, result.Status);
        Assert.Equal(jogo.Id, result.Jogo.Id);
    }

    [Fact]
    public async Task MarcarAsync_ExistingGame_UpdatesStatusInstead()
    {
        var db = TestDb.New();
        var jogo = await SeedJogoAsync(db);
        var service = new BibliotecaService(db);
        await service.MarcarAsync(1, jogo.Id, StatusJogo.QueroJogar);

        var result = await service.MarcarAsync(1, jogo.Id, StatusJogo.Jogando);

        Assert.Equal(StatusJogo.Jogando, result.Status);
        Assert.Single(db.UsuarioJogos); // did not create a duplicate row
    }

    [Fact]
    public async Task MarcarAsync_UnknownGame_Throws()
    {
        var db = TestDb.New();
        var service = new BibliotecaService(db);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.MarcarAsync(1, jogoId: 999, StatusJogo.Jogando));
    }

    [Fact]
    public async Task AtualizarAsync_ClampsNotaTo0To10Range()
    {
        var db = TestDb.New();
        var jogo = await SeedJogoAsync(db);
        var service = new BibliotecaService(db);
        var criado = await service.MarcarAsync(1, jogo.Id, StatusJogo.Zerado);

        var result = await service.AtualizarAsync(1, criado.Id, new AtualizarBibliotecaRequest(null, 15, null, null));

        Assert.Equal(10, result.Nota);
    }

    [Fact]
    public async Task AdicionarJogatinaAsync_CreatesReplayEntryUnderSameUsuarioJogo()
    {
        var db = TestDb.New();
        var jogo = await SeedJogoAsync(db);
        var service = new BibliotecaService(db);
        var uj = await service.MarcarAsync(1, jogo.Id, StatusJogo.Zerado);

        var jogatina = await service.AdicionarJogatinaAsync(1, uj.Id,
            new CriarJogatinaRequest(null, 2005, 40.5, StatusJogo.Zerado, false, "Primeira zerada"));

        Assert.Equal(2005, jogatina.Ano);
        Assert.Equal(40.5, jogatina.Horas);
    }

    [Fact]
    public async Task RemoverAsync_UnknownRecord_Throws()
    {
        var db = TestDb.New();
        var service = new BibliotecaService(db);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.RemoverAsync(1, usuarioJogoId: 999));
    }

    [Fact]
    public async Task ListarAsync_FiltersByStatus()
    {
        var db = TestDb.New();
        var jogo1 = await SeedJogoAsync(db, "Jogo A");
        var jogo2 = await SeedJogoAsync(db, "Jogo B");
        var service = new BibliotecaService(db);
        await service.MarcarAsync(1, jogo1.Id, StatusJogo.Jogando);
        await service.MarcarAsync(1, jogo2.Id, StatusJogo.Zerado);

        var jogando = await service.ListarAsync(1, StatusJogo.Jogando);

        Assert.Single(jogando);
        Assert.Equal("Jogo A", jogando[0].Jogo.Nome);
    }
}
