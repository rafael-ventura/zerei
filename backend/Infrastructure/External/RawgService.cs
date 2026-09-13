using System.Text.Json;

namespace Zerei.Infrastructure.External;

public class RawgOptions
{
    public string? ApiKey { get; set; }
    public string BaseUrl { get; set; } = "https://api.rawg.io/api";
}

public record RawgJogo(
    int? RawgId, string Nome, string? Slug, int? Ano, string? CapaUrl,
    List<string> Generos, List<string> Plataformas, int? Metacritic, double? TempoMedioHoras);

public record RawgDlc(int RawgId, string Nome, string? Slug, int? Ano, string? CapaUrl);

/// <summary>
/// Integração com a RAWG (catálogo global de jogos). Opcional: sem ApiKey configurada,
/// o app funciona apenas com o catálogo semeado localmente.
/// </summary>
public class RawgService
{
    private readonly HttpClient _http;
    private readonly RawgOptions _opt;
    private readonly ILogger<RawgService> _log;

    public RawgService(HttpClient http, RawgOptions opt, ILogger<RawgService> log)
    {
        _http = http;
        _opt = opt;
        _log = log;
    }

    public bool Configurado => !string.IsNullOrWhiteSpace(_opt.ApiKey);

    public async Task<List<RawgJogo>> BuscarAsync(string termo, int limite = 20)
    {
        if (!Configurado) return new();
        try
        {
            var url = $"{_opt.BaseUrl}/games?key={_opt.ApiKey}&search={Uri.EscapeDataString(termo)}&page_size={limite}";
            using var resp = await _http.GetAsync(url);
            if (!resp.IsSuccessStatusCode) return new();

            await using var stream = await resp.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(stream);

            var lista = new List<RawgJogo>();
            if (doc.RootElement.TryGetProperty("results", out var results))
                foreach (var item in results.EnumerateArray())
                    lista.Add(MapJogo(item));
            return lista;
        }
        catch (Exception ex)
        {
            _log.LogWarning(ex, "Falha ao consultar a RAWG para '{Termo}'", termo);
            return new();
        }
    }

    public async Task<RawgJogo?> PorNomeAsync(string nome) =>
        (await BuscarAsync(nome, 1)).FirstOrDefault();

    /// <summary>DLCs/expansões de um jogo (endpoint /games/{id}/additions — disponível no tier grátis).</summary>
    public async Task<List<RawgDlc>> BuscarDlcsAsync(int rawgId)
    {
        if (!Configurado) return new();
        try
        {
            var url = $"{_opt.BaseUrl}/games/{rawgId}/additions?key={_opt.ApiKey}&page_size=20";
            using var resp = await _http.GetAsync(url);
            if (!resp.IsSuccessStatusCode) return new();

            await using var stream = await resp.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(stream);

            var lista = new List<RawgDlc>();
            if (doc.RootElement.TryGetProperty("results", out var results))
                foreach (var item in results.EnumerateArray())
                {
                    var j = MapJogo(item);
                    if (j.RawgId is null) continue;
                    lista.Add(new RawgDlc(j.RawgId.Value, j.Nome, j.Slug, j.Ano, j.CapaUrl));
                }
            return lista;
        }
        catch (Exception ex)
        {
            _log.LogWarning(ex, "Falha ao consultar DLCs da RAWG para o jogo {RawgId}", rawgId);
            return new();
        }
    }

    private static RawgJogo MapJogo(JsonElement item)
    {
        int? id = item.TryGetProperty("id", out var idEl) && idEl.ValueKind == JsonValueKind.Number ? idEl.GetInt32() : null;
        string nome = item.TryGetProperty("name", out var nEl) ? nEl.GetString() ?? "" : "";
        string? slug = item.TryGetProperty("slug", out var sEl) ? sEl.GetString() : null;
        string? capa = item.TryGetProperty("background_image", out var cEl) ? cEl.GetString() : null;
        int? ano = null;
        if (item.TryGetProperty("released", out var rEl) && rEl.ValueKind == JsonValueKind.String
            && DateTime.TryParse(rEl.GetString(), out var dt))
            ano = dt.Year;

        int? metacritic = item.TryGetProperty("metacritic", out var mEl) && mEl.ValueKind == JsonValueKind.Number
            ? mEl.GetInt32() : null;
        double? tempoMedio = item.TryGetProperty("playtime", out var tEl) && tEl.ValueKind == JsonValueKind.Number && tEl.GetDouble() > 0
            ? tEl.GetDouble() : null;

        var generos = new List<string>();
        if (item.TryGetProperty("genres", out var gEl) && gEl.ValueKind == JsonValueKind.Array)
            foreach (var g in gEl.EnumerateArray())
                if (g.TryGetProperty("name", out var gnEl) && gnEl.GetString() is string gn)
                    generos.Add(gn);

        var plataformas = new List<string>();
        if (item.TryGetProperty("platforms", out var pEl) && pEl.ValueKind == JsonValueKind.Array)
            foreach (var p in pEl.EnumerateArray())
                if (p.TryGetProperty("platform", out var pfEl) && pfEl.TryGetProperty("name", out var pnEl) && pnEl.GetString() is string pn)
                    plataformas.Add(pn);

        return new RawgJogo(id, nome, slug, ano, capa, generos, plataformas, metacritic, tempoMedio);
    }
}
