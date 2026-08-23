using Zerei.Domain.Enums;

namespace Zerei.Domain.Entities;

/// <summary>
/// Vínculo entre um usuário e um jogo (o "cabeçalho"): status geral, nota, favorito, resenha.
/// As jogadas individuais ficam em <see cref="Jogatina"/>.
/// </summary>
public class UsuarioJogo
{
    public int Id { get; set; }

    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    public int JogoId { get; set; }
    public Jogo Jogo { get; set; } = null!;

    public StatusJogo Status { get; set; } = StatusJogo.QueroJogar;
    public int? Nota { get; set; }
    public bool Favorito { get; set; }
    public string? Resenha { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public List<Jogatina> Jogatinas { get; set; } = new();
}
