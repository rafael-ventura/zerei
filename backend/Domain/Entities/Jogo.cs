namespace Zerei.Domain.Entities;

public class Jogo
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int? Ano { get; set; }
    public string? CapaUrl { get; set; }

    /// <summary>Identificadores na RAWG (para enriquecer capa/metadados e evitar duplicar).</summary>
    public int? RawgId { get; set; }
    public string? RawgSlug { get; set; }

    /// <summary>Marcado no catálogo curado para aparecer no grid de onboarding.</summary>
    public bool Famoso { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public List<Genero> Generos { get; set; } = new();
    public List<UsuarioJogo> UsuarioJogos { get; set; } = new();
}
