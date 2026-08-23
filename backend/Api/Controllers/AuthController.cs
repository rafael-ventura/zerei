using Microsoft.AspNetCore.Mvc;
using Zerei.Application.Auth;
using Zerei.Application.Dtos;

namespace Zerei.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;
    public AuthController(AuthService auth) => _auth = auth;

    [HttpPost("registro")]
    public async Task<ActionResult<AuthResponse>> Registro(RegistroRequest req) =>
        Ok(await _auth.RegistrarAsync(req));

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req) =>
        Ok(await _auth.LoginAsync(req));
}
