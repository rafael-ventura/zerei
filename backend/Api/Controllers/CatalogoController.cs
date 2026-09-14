using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Zerei.Application.Dtos;
using Zerei.Application.Services;

namespace Zerei.Api.Controllers;

[ApiController]
[Route("api/catalogo")]
public class CatalogoController : ControllerBase
{
    private readonly CatalogoService _catalogo;
    public CatalogoController(CatalogoService catalogo) => _catalogo = catalogo;

    [HttpGet("generos")]
    public async Task<ActionResult<List<GeneroDto>>> Generos() =>
        Ok(await _catalogo.GenerosAsync());

    [HttpGet("plataformas")]
    public async Task<ActionResult<List<PlataformaDto>>> Plataformas() =>
        Ok(await _catalogo.PlataformasAsync());

    [HttpGet("famosos")]
    public async Task<ActionResult<List<JogoDto>>> Famosos([FromQuery] string? genero) =>
        Ok(await _catalogo.FamososAsync(genero));

    [HttpGet("jogos/{id:int}")]
    public async Task<ActionResult<JogoDto>> Jogo(int id)
    {
        var jogo = await _catalogo.PorIdAsync(id);
        return jogo is null ? NotFound() : Ok(jogo);
    }

    [HttpGet("jogos/{id:int}/relacionados")]
    public async Task<ActionResult<List<JogoDto>>> Relacionados(int id) =>
        Ok(await _catalogo.RelacionadosAsync(id));

    [HttpGet("busca")]
    public async Task<ActionResult<List<JogoDto>>> Busca([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return Ok(new List<JogoDto>());
        return Ok(await _catalogo.BuscarAsync(q.Trim()));
    }

    [Authorize]
    [HttpPost("sincronizar-capas")]
    public async Task<ActionResult> SincronizarCapas() =>
        Ok(new { atualizadas = await _catalogo.EnriquecerCapasAsync() });

    [Authorize]
    [HttpPost("sincronizar-notas")]
    public async Task<ActionResult> SincronizarNotas() =>
        Ok(new { atualizadas = await _catalogo.EnriquecerNotasAsync() });
}
