namespace Zerei.Domain.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? FotoUrl { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    /// <summary>Gêneros escolhidos no onboarding — usados para sugerir jogos.</summary>
    public List<Genero> GenerosPreferidos { get; set; } = new();
    public List<UsuarioJogo> UsuarioJogos { get; set; } = new();
}
