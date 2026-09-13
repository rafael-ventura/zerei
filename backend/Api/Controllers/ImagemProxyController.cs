using Microsoft.AspNetCore.Mvc;

namespace Zerei.Api.Controllers;

/// <summary>
/// Proxy estrito pra imagens da RAWG — necessário porque media.rawg.io não envia CORS,
/// o que impede rasterizar as capas em canvas no front (ex.: exportar a imagem do Wrapped).
/// Só aceita o host da RAWG, pra não virar um proxy aberto (risco de SSRF).
/// </summary>
[ApiController]
[Route("api/imagem-proxy")]
public class ImagemProxyController : ControllerBase
{
    private static readonly string[] HostsPermitidos = { "media.rawg.io" };
    private readonly HttpClient _http;

    public ImagemProxyController(HttpClient http) => _http = http;

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)
            || uri.Scheme != Uri.UriSchemeHttps
            || !HostsPermitidos.Contains(uri.Host))
            return BadRequest();

        var resp = await _http.GetAsync(uri);
        if (!resp.IsSuccessStatusCode) return NotFound();

        var bytes = await resp.Content.ReadAsByteArrayAsync();
        var contentType = resp.Content.Headers.ContentType?.ToString() ?? "image/jpeg";
        return File(bytes, contentType);
    }
}
