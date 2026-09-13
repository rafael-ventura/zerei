using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Zerei.Application.Dtos;
using Zerei.Application.Services;

namespace Zerei.Api.Controllers;

[Authorize]
[Route("api")]
public class SeguidorController : ApiControllerBase
{
    private readonly SeguidorService _seguidor;
    public SeguidorController(SeguidorService seguidor) => _seguidor = seguidor;

    [HttpPost("seguidores/{usuarioId:int}")]
    public async Task<ActionResult> Seguir(int usuarioId)
    {
        await _seguidor.SeguirAsync(UsuarioId, usuarioId);
        return Ok();
    }

    [HttpDelete("seguidores/{usuarioId:int}")]
    public async Task<ActionResult> DeixarDeSeguir(int usuarioId)
    {
        await _seguidor.DeixarDeSeguirAsync(UsuarioId, usuarioId);
        return NoContent();
    }

    [HttpGet("seguidores")]
    public async Task<ActionResult<List<UsuarioPublicoDto>>> Seguidores() =>
        Ok(await _seguidor.SeguidoresAsync(UsuarioId));

    [HttpGet("seguindo")]
    public async Task<ActionResult<List<UsuarioPublicoDto>>> Seguindo() =>
        Ok(await _seguidor.SeguindoAsync(UsuarioId));
}
