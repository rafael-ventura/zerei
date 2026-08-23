using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Zerei.Application.Dtos;
using Zerei.Application.Services;

namespace Zerei.Api.Controllers;

[Authorize]
[Route("api/perfil")]
public class PerfilController : ApiControllerBase
{
    private readonly PerfilService _perfil;
    public PerfilController(PerfilService perfil) => _perfil = perfil;

    [HttpGet]
    public async Task<ActionResult<PerfilDto>> Meu() =>
        Ok(await _perfil.PerfilAsync(UsuarioId));

    [HttpGet("estatisticas")]
    public async Task<ActionResult<EstatisticasDto>> Estatisticas() =>
        Ok(await _perfil.EstatisticasAsync(UsuarioId));
}
