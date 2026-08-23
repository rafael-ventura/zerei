using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Zerei.Domain.Entities;

namespace Zerei.Application.Auth;

public class JwtService
{
    private readonly IConfiguration _config;
    public JwtService(IConfiguration config) => _config = config;

    public string GerarToken(Usuario usuario)
    {
        var segredo = _config["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret não configurado.");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(segredo));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Username),
            new Claim(ClaimTypes.Email, usuario.Email),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "zerei",
            audience: _config["Jwt:Audience"] ?? "zerei",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
