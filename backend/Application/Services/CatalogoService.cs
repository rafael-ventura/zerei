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
        var jogo = await _db.Jogos
            .Include(j => j.Generos)
            .Include(j => j.PlataformasDisponiveis)
            .Include(j => j.Dlcs)
            .FirstOrDefaultAsync(j => j.Id == id);
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
        var generoCache = new Dictionary<string, Genero>();
        var plataformaCache = new Dictionary<string, Plataforma>();
        var novos = new List<(Jogo Jogo, int RawgId)>();

        foreach (var r in rawgResultados)
        {
            if (r.RawgId is null) continue;
            var existente = await _db.Jogos.FirstOrDefaultAsync(j => j.RawgId == r.RawgId);
            if (existente is null)
            {
                var jogo = new Jogo
                {
                    Nome = r.Nome,
                    Ano = r.Ano,
                    CapaUrl = r.CapaUrl,
                    RawgId = r.RawgId,
                    RawgSlug = r.Slug,
                    Metacritic = r.Metacritic,
                    TempoMedioHoras = r.TempoMedioHoras,
                };
                foreach (var nomeGenero in r.Generos)
                    jogo.Generos.Add(await ObterOuCriarGeneroAsync(nomeGenero, generoCache));
                foreach (var nomePlataforma in r.Plataformas)
                    jogo.PlataformasDisponiveis.Add(await ObterOuCriarPlataformaAsync(nomePlataforma, plataformaCache));

                _db.Jogos.Add(jogo);
                novos.Add((jogo, r.RawgId.Value));
            }
            else if (existente.CapaUrl is null && r.CapaUrl is not null)
            {
                existente.CapaUrl = r.CapaUrl;
            }
        }
        await _db.SaveChangesAsync();

        // DLCs só pra jogos recém-importados (1 chamada extra por jogo novo, não por busca).
        foreach (var (jogo, rawgId) in novos)
            await ImportarDlcsAsync(jogo, rawgId);
        if (novos.Count > 0)
            await _db.SaveChangesAsync();

        var rawgIds = rawgResultados.Where(x => x.RawgId.HasValue).Select(x => x.RawgId!.Value).ToList();
        var combinados = await _db.Jogos.Include(j => j.Generos)
            .Where(j => EF.Functions.ILike(j.Nome, $"%{termo}%")
                        || (j.RawgId != null && rawgIds.Contains(j.RawgId.Value)))
            .OrderBy(j => j.Nome).Take(40).ToListAsync();

        return combinados.Select(Mapeamentos.ToDto).ToList();
    }

    /// <summary>Preenche capas e metadados (metacritic, tempo médio, gêneros, plataformas) faltantes consultando a RAWG (idempotente).</summary>
    public async Task<int> EnriquecerCapasAsync(int max = 80)
    {
        if (!_rawg.Configurado) return 0;

        var semCapa = await _db.Jogos.Include(j => j.Generos).Include(j => j.PlataformasDisponiveis)
            .Where(j => j.CapaUrl == null).OrderBy(j => j.Id).Take(max).ToListAsync();
        var generoCache = new Dictionary<string, Genero>();
        var plataformaCache = new Dictionary<string, Plataforma>();
        var atualizadas = 0;
        foreach (var jogo in semCapa)
        {
            var r = await _rawg.PorNomeAsync(jogo.Nome);
            if (r?.CapaUrl is null) continue;
            jogo.CapaUrl = r.CapaUrl;
            jogo.RawgId ??= r.RawgId;
            jogo.RawgSlug ??= r.Slug;
            jogo.Metacritic ??= r.Metacritic;
            jogo.TempoMedioHoras ??= r.TempoMedioHoras;
            foreach (var nomeGenero in r.Generos)
            {
                var genero = await ObterOuCriarGeneroAsync(nomeGenero, generoCache);
                if (!jogo.Generos.Contains(genero)) jogo.Generos.Add(genero);
            }
            foreach (var nomePlataforma in r.Plataformas)
            {
                var plataforma = await ObterOuCriarPlataformaAsync(nomePlataforma, plataformaCache);
                if (!jogo.PlataformasDisponiveis.Contains(plataforma)) jogo.PlataformasDisponiveis.Add(plataforma);
            }
            atualizadas++;
        }
        await _db.SaveChangesAsync();
        return atualizadas;
    }

    private async Task ImportarDlcsAsync(Jogo jogoBase, int rawgId)
    {
        var dlcs = await _rawg.BuscarDlcsAsync(rawgId);
        foreach (var d in dlcs)
        {
            if (await _db.Jogos.AnyAsync(j => j.RawgId == d.RawgId)) continue;
            _db.Jogos.Add(new Jogo
            {
                Nome = d.Nome,
                Ano = d.Ano,
                CapaUrl = d.CapaUrl,
                RawgId = d.RawgId,
                RawgSlug = d.Slug,
                EhDlc = true,
                JogoBase = jogoBase,
            });
        }
    }

    private static string Slugify(string nome) =>
        string.Concat(nome.Trim().ToLowerInvariant().Select(c => char.IsLetterOrDigit(c) ? c : '-'))
            .Trim('-');

    /// <summary>
    /// A RAWG usa uma taxonomia fixa de gêneros em inglês; o catálogo curado (<see cref="SeedData"/>) já tinha
    /// boa parte desses conceitos em português. Sem isso, "Action" (RAWG) e "Ação" (seed) viram duas linhas
    /// diferentes na tabela — mapeamos os que já existem em português pro slug existente, em vez de duplicar.
    /// Gêneros sem equivalente no seed (ex.: "Casual", "Arcade") continuam sendo criados normalmente.
    /// </summary>
    private static readonly Dictionary<string, string> GenerosRawgParaSlugExistente = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Action"] = "acao",
        ["Adventure"] = "aventura",
        ["Strategy"] = "estrategia",
        ["Shooter"] = "fps",
        ["Racing"] = "corrida",
        ["Sports"] = "esporte",
        ["Fighting"] = "luta",
        ["Platformer"] = "plataforma",
        ["Simulation"] = "simulacao",
    };

    private async Task<Genero> ObterOuCriarGeneroAsync(string nome, Dictionary<string, Genero> cache)
    {
        var slug = GenerosRawgParaSlugExistente.TryGetValue(nome, out var slugExistente) ? slugExistente : Slugify(nome);
        if (cache.TryGetValue(slug, out var cacheado)) return cacheado;
        var genero = await _db.Generos.FirstOrDefaultAsync(g => g.Slug == slug);
        if (genero is null)
        {
            genero = new Genero { Nome = nome, Slug = slug };
            _db.Generos.Add(genero);
        }
        cache[slug] = genero;
        return genero;
    }

    private async Task<Plataforma> ObterOuCriarPlataformaAsync(string nome, Dictionary<string, Plataforma> cache)
    {
        var slug = Slugify(nome);
        if (cache.TryGetValue(slug, out var cacheada)) return cacheada;
        var plataforma = await _db.Plataformas.FirstOrDefaultAsync(p => p.Slug == slug);
        if (plataforma is null)
        {
            plataforma = new Plataforma { Nome = nome, Slug = slug, Familia = "Outros" };
            _db.Plataformas.Add(plataforma);
        }
        cache[slug] = plataforma;
        return plataforma;
    }
}
