namespace Zerei.Application.Dtos;

public record GeneroDto(int Id, string Nome, string Slug);
public record PlataformaDto(int Id, string Nome, string Slug, string Familia);
public record DlcResumoDto(int Id, string Nome, string? CapaUrl);

public record JogoDto(
    int Id, string Nome, int? Ano, string? CapaUrl, List<string> Generos, int? Metacritic, double? TempoMedioHoras,
    List<string> PlataformasDisponiveis, List<DlcResumoDto> Dlcs);
