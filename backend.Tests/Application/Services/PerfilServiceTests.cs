using Zerei.Application.Services;
using Zerei.Domain.Entities;
using Zerei.Domain.Enums;
using Xunit;

namespace Zerei.Tests.Application.Services;

public class PerfilServiceTests
{
    [Fact]
    public async Task EstatisticasAsync_AggregatesCountsHoursAndAverageRating()
    {
        var db = TestDb.New();
        var rpg = new Genero { Nome = "RPG", Slug = "rpg" };
        var ps2 = new Plataforma { Nome = "PS2", Slug = "ps2", Familia = "PlayStation" };
        db.Generos.Add(rpg);
        db.Plataformas.Add(ps2);

        var jogo1 = new Jogo { Nome = "Final Fantasy X", Generos = { rpg } };
        var jogo2 = new Jogo { Nome = "Persona 4", Generos = { rpg } };
        db.Jogos.AddRange(jogo1, jogo2);
        await db.SaveChangesAsync();

        db.UsuarioJogos.AddRange(
            new UsuarioJogo
            {
                UsuarioId = 1,
                JogoId = jogo1.Id,
                Status = StatusJogo.Platinado,
                Nota = 10,
                Jogatinas = { new Jogatina { PlataformaId = ps2.Id, Horas = 40, Status = StatusJogo.Platinado } },
            },
            new UsuarioJogo
            {
                UsuarioId = 1,
                JogoId = jogo2.Id,
                Status = StatusJogo.Jogando,
                Nota = 8,
                Jogatinas = { new Jogatina { PlataformaId = ps2.Id, Horas = 12.5, Status = StatusJogo.Jogando } },
            });
        await db.SaveChangesAsync();

        var service = new PerfilService(db);
        var stats = await service.EstatisticasAsync(1);

        Assert.Equal(2, stats.TotalJogos);
        Assert.Equal(1, stats.Platinados);
        Assert.Equal(1, stats.Jogando);
        Assert.Equal(52.5, stats.TotalHoras);
        Assert.Equal(9, stats.NotaMedia);
        Assert.Equal("PS2", stats.PlataformaFavorita);
        Assert.Equal("RPG", stats.GeneroFavorito);
    }

    [Fact]
    public async Task EstatisticasAsync_NoEntries_ReturnsZeroedStatsWithNullAverage()
    {
        var db = TestDb.New();
        var service = new PerfilService(db);

        var stats = await service.EstatisticasAsync(usuarioId: 42);

        Assert.Equal(0, stats.TotalJogos);
        Assert.Null(stats.NotaMedia);
        Assert.Null(stats.PlataformaFavorita);
    }

    [Fact]
    public async Task PerfilAsync_UnknownUser_Throws()
    {
        var db = TestDb.New();
        var service = new PerfilService(db);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.PerfilAsync(usuarioId: 999));
    }

    [Theory]
    [InlineData(StatusJogo.QueroJogar, "Quero jogar")]
    [InlineData(StatusJogo.CemPorcento, "100%")]
    [InlineData(StatusJogo.Platinado, "Platinado")]
    public void StatusLabel_ReturnsExpectedPortugueseLabel(StatusJogo status, string expected)
    {
        Assert.Equal(expected, PerfilService.StatusLabel(status));
    }
}
