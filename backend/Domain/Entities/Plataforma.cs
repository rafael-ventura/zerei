namespace Zerei.Domain.Entities;

public class Plataforma
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    /// <summary>Família para agrupar estatísticas: Nintendo, PlayStation, Xbox, PC, Sega, Mobile, Outros.</summary>
    public string Familia { get; set; } = "Outros";
}
