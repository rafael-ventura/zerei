using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Zerei.Api.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected int UsuarioId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Usuário não autenticado."));
}
