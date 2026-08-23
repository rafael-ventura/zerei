using Microsoft.EntityFrameworkCore;
using Zerei.Application.Auth;
using Zerei.Application.Dtos;
using Zerei.Domain.Enums;
using Zerei.Infrastructure.Data;

namespace Zerei.Application.Services;

public class PerfilService
{
    private readonly ZereiDbContext _db;
    public PerfilService(ZereiDbContext db) => _db = db;

    public async Task<EstatisticasDto> EstatisticasAsync(int usuarioId)
    {
        var ujs = await _db.UsuarioJogos
            .Where(uj => uj.UsuarioId == usuarioId)
            .Include(uj => uj.Jogo).ThenInclude(j => j.Generos)
            .Include(uj => uj.Jogatinas).ThenInclude(j => j.Plataforma)
            .ToListAsync();

        var total = ujs.Count;
        var jogando = ujs.Count(x => x.Status == StatusJogo.Jogando);
        var zerados = ujs.Count(x => x.Status is StatusJogo.Zerado or StatusJogo.CemPorcento or StatusJogo.Platinado);
        var platinados = ujs.Count(x => x.Status == StatusJogo.Platinado);
        var abandonados = ujs.Count(x => x.Status == StatusJogo.Abandonado);
        var queroJogar = ujs.Count(x => x.Status == StatusJogo.QueroJogar);

        var todasJogatinas = ujs.SelectMany(x => x.Jogatinas).ToList();
        var totalHoras = Math.Round(todasJogatinas.Sum(j => j.Horas ?? 0), 1);

        var notas = ujs.Where(x => x.Nota.HasValue).Select(x => x.Nota!.Value).ToList();
        double? notaMedia = notas.Count > 0 ? Math.Round(notas.Average(), 1) : null;

        var comPlataforma = todasJogatinas.Where(j => j.Plataforma != null).ToList();
        var plataformaFavorita = comPlataforma
            .GroupBy(j => j.Plataforma!.Nome)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key).FirstOrDefault();

        var generoFavorito = ujs
            .SelectMany(x => x.Jogo.Generos)
            .GroupBy(g => g.Nome)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key).FirstOrDefault();

        var porFamilia = comPlataforma
            .GroupBy(j => j.Plataforma!.Familia)
            .Select(g => new DistribuicaoItem(g.Key, g.Count()))
            .OrderByDescending(d => d.Quantidade).ToList();

        var porStatus = ujs
            .GroupBy(x => x.Status)
            .Select(g => new DistribuicaoItem(StatusLabel(g.Key), g.Count()))
            .OrderByDescending(d => d.Quantidade).ToList();

        return new EstatisticasDto(total, jogando, zerados, platinados, abandonados, queroJogar,
            totalHoras, notaMedia, plataformaFavorita, generoFavorito, porFamilia, porStatus);
    }

    public async Task<PerfilDto> PerfilAsync(int usuarioId)
    {
        var usuario = await _db.Usuarios.FindAsync(usuarioId)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        var stats = await EstatisticasAsync(usuarioId);

        var favoritos = await _db.UsuarioJogos
            .Where(uj => uj.UsuarioId == usuarioId && uj.Favorito)
            .Include(uj => uj.Jogo).ThenInclude(j => j.Generos)
            .Include(uj => uj.Jogatinas).ThenInclude(j => j.Plataforma)
            .OrderByDescending(uj => uj.AtualizadoEm)
            .Take(8)
            .ToListAsync();

        return new PerfilDto(AuthService.ToResumo(usuario), stats, favoritos.Select(Mapeamentos.ToDto).ToList());
    }

    public static string StatusLabel(StatusJogo s) => s switch
    {
        StatusJogo.QueroJogar => "Quero jogar",
        StatusJogo.Jogando => "Jogando",
        StatusJogo.Jogado => "Jogado",
        StatusJogo.Zerado => "Zerado",
        StatusJogo.CemPorcento => "100%",
        StatusJogo.Platinado => "Platinado",
        StatusJogo.Abandonado => "Abandonado",
        _ => s.ToString()
    };
}
