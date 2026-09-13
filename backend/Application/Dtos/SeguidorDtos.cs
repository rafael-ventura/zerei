namespace Zerei.Application.Dtos;

/// <summary>Dados públicos de um usuário — sem e-mail, pra listas de seguidores/seguindo visíveis por terceiros.</summary>
public record UsuarioPublicoDto(int Id, string Nome, string Username, string? FotoUrl, string? Bio);
