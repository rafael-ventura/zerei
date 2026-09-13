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

    /// <summary>Zerou o jogo (só faz sentido se Status == Jogado).</summary>
    public bool Zerado { get; set; }
    /// <summary>Completou tudo (platina ou 100%, tratados como a mesma coisa aqui) — implica Zerado.</summary>
    public bool Platinado { get; set; }
    /// <summary>Jogou mas parou sem zerar — irmão de Zerado, não filho.</summary>
    public bool Abandonado { get; set; }

    public int? Nota { get; set; }
    public bool Favorito { get; set; }
    public string? Resenha { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public List<Jogatina> Jogatinas { get; set; } = new();
}
