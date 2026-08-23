namespace Zerei.Domain.Entities;

public class Genero
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    public List<Jogo> Jogos { get; set; } = new();
}
