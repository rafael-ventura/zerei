namespace Zerei.Application.Dtos;

public record RegistroRequest(string Nome, string Username, string Email, string Senha);
public record LoginRequest(string EmailOuUsername, string Senha);
public record UsuarioResumoDto(int Id, string Nome, string Username, string Email, string? FotoUrl, string? Bio);
public record AuthResponse(string Token, UsuarioResumoDto Usuario);
