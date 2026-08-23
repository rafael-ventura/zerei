using Microsoft.EntityFrameworkCore;
using Zerei.Application.Dtos;
using Zerei.Domain.Entities;
using Zerei.Infrastructure.Data;

namespace Zerei.Application.Auth;

public class AuthService
{
    private readonly ZereiDbContext _db;
    private readonly JwtService _jwt;

    public AuthService(ZereiDbContext db, JwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthResponse> RegistrarAsync(RegistroRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Senha))
            throw new InvalidOperationException("Nome de usuário, e-mail e senha são obrigatórios.");
        if (req.Senha.Length < 6)
            throw new InvalidOperationException("A senha precisa ter ao menos 6 caracteres.");

        var email = req.Email.Trim().ToLowerInvariant();
        var username = req.Username.Trim().ToLowerInvariant();

        if (await _db.Usuarios.AnyAsync(u => u.Email == email))
            throw new InvalidOperationException("E-mail já cadastrado.");
        if (await _db.Usuarios.AnyAsync(u => u.Username == username))
            throw new InvalidOperationException("Nome de usuário já está em uso.");

        var usuario = new Usuario
        {
            Nome = string.IsNullOrWhiteSpace(req.Nome) ? username : req.Nome.Trim(),
            Username = username,
            Email = email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(req.Senha),
        };
        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        return new AuthResponse(_jwt.GerarToken(usuario), ToResumo(usuario));
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req)
    {
        var ident = (req.EmailOuUsername ?? "").Trim().ToLowerInvariant();
        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Email == ident || u.Username == ident);
        if (usuario is null || !BCrypt.Net.BCrypt.Verify(req.Senha, usuario.SenhaHash))
            throw new UnauthorizedAccessException("Credenciais inválidas.");

        return new AuthResponse(_jwt.GerarToken(usuario), ToResumo(usuario));
    }

    public static UsuarioResumoDto ToResumo(Usuario u) =>
        new(u.Id, u.Nome, u.Username, u.Email, u.FotoUrl, u.Bio);
}
