namespace Zerei.Domain.Entities;

public class Plataforma
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    /// <summary>Família para agrupar estatísticas: Nintendo, PlayStation, Xbox, PC, Sega, Mobile, Outros.</summary>
    public string Familia { get; set; } = "Outros";

    /// <summary>Jogos que foram lançados nesta plataforma (dado de catálogo, vindo da RAWG) — distinto da plataforma pessoal em <see cref="Jogatina"/> (onde o usuário jogou).</summary>
    public List<Jogo> JogosDisponiveis { get; set; } = new();
}
