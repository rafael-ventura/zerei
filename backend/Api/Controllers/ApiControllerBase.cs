using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Zerei.Api.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected int UsuarioId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Usuário não autenticado."));

    /// <summary>Como <see cref="UsuarioId"/>, mas para endpoints [AllowAnonymous]: retorna null em vez de lançar quando não há usuário autenticado.</summary>
    protected int? UsuarioIdOuNulo =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}
