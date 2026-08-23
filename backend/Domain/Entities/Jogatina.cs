using Zerei.Domain.Enums;

namespace Zerei.Domain.Entities;

/// <summary>
/// Uma jogada específica de um jogo: plataforma, ano, horas e status alcançado.
/// O mesmo jogo pode ter várias jogatinas (rejogadas em plataformas e anos diferentes).
/// </summary>
public class Jogatina
{
    public int Id { get; set; }

    public int UsuarioJogoId { get; set; }
    public UsuarioJogo UsuarioJogo { get; set; } = null!;

    public int? PlataformaId { get; set; }
    public Plataforma? Plataforma { get; set; }

    public int? Ano { get; set; }
    public double? Horas { get; set; }
    public StatusJogo Status { get; set; } = StatusJogo.Jogado;
    public bool EhRejogada { get; set; }
    public string? Observacao { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
