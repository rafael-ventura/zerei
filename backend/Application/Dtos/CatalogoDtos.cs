namespace Zerei.Application.Dtos;

public record GeneroDto(int Id, string Nome, string Slug);
public record PlataformaDto(int Id, string Nome, string Slug, string Familia);
public record JogoDto(int Id, string Nome, int? Ano, string? CapaUrl, List<string> Generos);
