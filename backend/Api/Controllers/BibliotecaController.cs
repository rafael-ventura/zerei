using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Zerei.Application.Dtos;
using Zerei.Application.Services;
using Zerei.Domain.Enums;

namespace Zerei.Api.Controllers;

[Authorize]
[Route("api/biblioteca")]
public class BibliotecaController : ApiControllerBase
{
    private readonly BibliotecaService _bib;
    public BibliotecaController(BibliotecaService bib) => _bib = bib;

    [HttpGet]
    public async Task<ActionResult<List<UsuarioJogoDto>>> Listar([FromQuery] StatusJogo? status) =>
        Ok(await _bib.ListarAsync(UsuarioId, status));

    [HttpGet("jogo/{jogoId:int}")]
    public async Task<ActionResult<UsuarioJogoDto>> PorJogo(int jogoId)
    {
        var uj = await _bib.ObterPorJogoAsync(UsuarioId, jogoId);
        return uj is null ? NotFound() : Ok(uj);
    }

    [HttpPost("marcar")]
    public async Task<ActionResult<UsuarioJogoDto>> Marcar(MarcarRequest req) =>
        Ok(await _bib.MarcarAsync(UsuarioId, req.JogoId, req.Status));

    [HttpPost("marcar-lote")]
    public async Task<ActionResult> MarcarLote(MarcarLoteRequest req)
    {
        await _bib.MarcarLoteAsync(UsuarioId, req.JogoIds, req.Status);
        return Ok(new { marcados = req.JogoIds?.Count ?? 0 });
    }

    [HttpPut("{usuarioJogoId:int}")]
    public async Task<ActionResult<UsuarioJogoDto>> Atualizar(int usuarioJogoId, AtualizarBibliotecaRequest req) =>
        Ok(await _bib.AtualizarAsync(UsuarioId, usuarioJogoId, req));

    [HttpDelete("{usuarioJogoId:int}")]
    public async Task<ActionResult> Remover(int usuarioJogoId)
    {
        await _bib.RemoverAsync(UsuarioId, usuarioJogoId);
        return NoContent();
    }

    [HttpPost("{usuarioJogoId:int}/jogatinas")]
    public async Task<ActionResult<JogatinaDto>> AdicionarJogatina(int usuarioJogoId, CriarJogatinaRequest req) =>
        Ok(await _bib.AdicionarJogatinaAsync(UsuarioId, usuarioJogoId, req));

    [HttpDelete("jogatinas/{jogatinaId:int}")]
    public async Task<ActionResult> RemoverJogatina(int jogatinaId)
    {
        await _bib.RemoverJogatinaAsync(UsuarioId, jogatinaId);
        return NoContent();
    }
}
