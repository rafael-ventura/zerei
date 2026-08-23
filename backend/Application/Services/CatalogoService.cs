using Microsoft.EntityFrameworkCore;
using Zerei.Application.Dtos;
using Zerei.Domain.Entities;
using Zerei.Infrastructure.Data;
using Zerei.Infrastructure.External;

namespace Zerei.Application.Services;

public class CatalogoService
{
    private readonly ZereiDbContext _db;
    private readonly RawgService _rawg;

    public CatalogoService(ZereiDbContext db, RawgService rawg)
    {
        _db = db;
        _rawg = rawg;
    }

    public async Task<List<GeneroDto>> GenerosAsync() =>
        await _db.Generos.OrderBy(g => g.Nome)
            .Select(g => new GeneroDto(g.Id, g.Nome, g.Slug)).ToListAsync();

    public async Task<List<PlataformaDto>> PlataformasAsync() =>
        await _db.Plataformas.OrderBy(p => p.Familia).ThenBy(p => p.Id)
            .Select(p => new PlataformaDto(p.Id, p.Nome, p.Slug, p.Familia)).ToListAsync();

    public async Task<List<JogoDto>> FamososAsync(string? generoSlug)
    {
        var query = _db.Jogos.Include(j => j.Generos).Where(j => j.Famoso);
        if (!string.IsNullOrWhiteSpace(generoSlug))
            query = query.Where(j => j.Generos.Any(g => g.Slug == generoSlug));

        var jogos = await query.OrderBy(j => j.Nome).ToListAsync();
        return jogos.Select(Mapeamentos.ToDto).ToList();
    }

    public async Task<JogoDto?> PorIdAsync(int id)
    {
        var jogo = await _db.Jogos.Include(j => j.Generos).FirstOrDefaultAsync(j => j.Id == id);
        return jogo is null ? null : Mapeamentos.ToDto(jogo);
    }

    public async Task<List<JogoDto>> BuscarAsync(string termo)
    {
        // Resultados que já estão no catálogo local
        var locais = await _db.Jogos.Include(j => j.Generos)
            .Where(j => EF.Functions.ILike(j.Nome, $"%{termo}%"))
            .OrderBy(j => j.Nome).Take(20).ToListAsync();

        if (!_rawg.Configurado)
            return locais.Select(Mapeamentos.ToDto).ToList();

        // Complementa com a RAWG e importa o que ainda não existe
        var rawgResultados = await _rawg.BuscarAsync(termo, 20);
        foreach (var r in rawgResultados)
        {
            if (r.RawgId is null) continue;
            var existente = await _db.Jogos.FirstOrDefaultAsync(j => j.RawgId == r.RawgId);
            if (existente is null)
            {
                _db.Jogos.Add(new Jogo
                {
                    Nome = r.Nome,
                    Ano = r.Ano,
                    CapaUrl = r.CapaUrl,
                    RawgId = r.RawgId,
                    RawgSlug = r.Slug
                });
            }
            else if (existente.CapaUrl is null && r.CapaUrl is not null)
            {
                existente.CapaUrl = r.CapaUrl;
            }
        }
        await _db.SaveChangesAsync();

        var rawgIds = rawgResultados.Where(x => x.RawgId.HasValue).Select(x => x.RawgId!.Value).ToList();
        var combinados = await _db.Jogos.Include(j => j.Generos)
            .Where(j => EF.Functions.ILike(j.Nome, $"%{termo}%")
                        || (j.RawgId != null && rawgIds.Contains(j.RawgId.Value)))
            .OrderBy(j => j.Nome).Take(40).ToListAsync();

        return combinados.Select(Mapeamentos.ToDto).ToList();
    }

    /// <summary>Preenche capas faltantes consultando a RAWG (idempotente).</summary>
    public async Task<int> EnriquecerCapasAsync(int max = 80)
    {
        if (!_rawg.Configurado) return 0;

        var semCapa = await _db.Jogos.Where(j => j.CapaUrl == null).Take(max).ToListAsync();
        var atualizadas = 0;
        foreach (var jogo in semCapa)
        {
            var r = await _rawg.PorNomeAsync(jogo.Nome);
            if (r?.CapaUrl is null) continue;
            jogo.CapaUrl = r.CapaUrl;
            jogo.RawgId ??= r.RawgId;
            jogo.RawgSlug ??= r.Slug;
            atualizadas++;
        }
        await _db.SaveChangesAsync();
        return atualizadas;
    }
}
