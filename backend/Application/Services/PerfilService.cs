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
        var zerados = ujs.Count(x => x.Zerado);
        var platinados = ujs.Count(x => x.Platinado);
        var abandonados = ujs.Count(x => x.Abandonado);
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

        // Zerado/Platinado se sobrepõem de propósito aqui (todo platinado também é zerado) —
        // não dá mais pra fazer um GroupBy simples por Status, já que essas são flags, não valores exclusivos.
        var porStatus = new[]
        {
            new DistribuicaoItem(StatusLabel(StatusJogo.QueroJogar), queroJogar),
            new DistribuicaoItem(StatusLabel(StatusJogo.Jogando), jogando),
            new DistribuicaoItem("Zerado", zerados),
            new DistribuicaoItem("Platinado", platinados),
            new DistribuicaoItem("Abandonado", abandonados),
        }.Where(d => d.Quantidade > 0).OrderByDescending(d => d.Quantidade).ToList();

        return new EstatisticasDto(total, jogando, zerados, platinados, abandonados, queroJogar,
            totalHoras, notaMedia, plataformaFavorita, generoFavorito, porFamilia, porStatus);
    }

    public async Task<PerfilDto> PerfilAsync(int usuarioId)
    {
        var usuario = await _db.Usuarios.FindAsync(usuarioId)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        var stats = await EstatisticasAsync(usuarioId);
        var favoritos = await FavoritosAsync(usuarioId);

        return new PerfilDto(AuthService.ToResumo(usuario), stats, favoritos);
    }

    /// <summary>Perfil público de outro usuário (por username) — sem e-mail, com contadores de seguidores/seguindo.</summary>
    public async Task<PerfilPublicoDto?> PerfilPublicoAsync(string username, int? chamadorId)
    {
        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Username == username.Trim().ToLowerInvariant());
        if (usuario is null) return null;

        var stats = await EstatisticasAsync(usuario.Id);
        var favoritos = await FavoritosAsync(usuario.Id);
        var seguidores = await _db.Seguidores.CountAsync(s => s.SeguidoId == usuario.Id);
        var seguindo = await _db.Seguidores.CountAsync(s => s.SeguidorId == usuario.Id);
        var voceSegue = chamadorId.HasValue &&
            await _db.Seguidores.AnyAsync(s => s.SeguidorId == chamadorId.Value && s.SeguidoId == usuario.Id);

        var usuarioPublico = new UsuarioPublicoDto(usuario.Id, usuario.Nome, usuario.Username, usuario.FotoUrl, usuario.Bio);
        return new PerfilPublicoDto(usuarioPublico, stats, favoritos, seguidores, seguindo, voceSegue);
    }

    private async Task<List<UsuarioJogoDto>> FavoritosAsync(int usuarioId)
    {
        var favoritos = await _db.UsuarioJogos
            .Where(uj => uj.UsuarioId == usuarioId && uj.Favorito)
            .Include(uj => uj.Jogo).ThenInclude(j => j.Generos)
            .Include(uj => uj.Jogatinas).ThenInclude(j => j.Plataforma)
            .OrderByDescending(uj => uj.AtualizadoEm)
            .Take(8)
            .ToListAsync();
        return favoritos.Select(Mapeamentos.ToDto).ToList();
    }

    public static string StatusLabel(StatusJogo s) => s switch
    {
        StatusJogo.QueroJogar => "Quero jogar",
        StatusJogo.Jogando => "Jogando",
        StatusJogo.Jogado => "Jogado",
        _ => s.ToString()
    };
}
