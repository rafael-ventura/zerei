namespace Zerei.Domain.Entities;

/// <summary>Relação de "seguir": <see cref="SeguidorId"/> segue <see cref="SeguidoId"/>.</summary>
public class Seguidor
{
    public int Id { get; set; }

    public int SeguidorId { get; set; }
    public Usuario SeguidorUsuario { get; set; } = null!;

    public int SeguidoId { get; set; }
    public Usuario SeguidoUsuario { get; set; } = null!;

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
