using Zerei.Domain.Enums;

namespace Zerei.Application.Dtos;

public record MarcarRequest(int JogoId, StatusJogo Status);
public record MarcarLoteRequest(List<int> JogoIds, StatusJogo Status);
public record AtualizarBibliotecaRequest(
    StatusJogo? Status, int? Nota, bool? Favorito, string? Resenha,
    bool? Zerado, bool? Platinado, bool? Abandonado,
    int? PlataformaId = null, double? Horas = null);
public record CriarJogatinaRequest(
    int? PlataformaId, int? Ano, double? Horas, StatusJogo Status, bool EhRejogada, string? Observacao,
    bool Zerado = false, bool Platinado = false, bool Abandonado = false);
public record JogatinaDto(
    int Id, int? PlataformaId, string? Plataforma, int? Ano, double? Horas, StatusJogo Status,
    bool Zerado, bool Platinado, bool Abandonado, bool EhRejogada, string? Observacao);
public record UsuarioJogoDto(
    int Id, JogoDto Jogo, StatusJogo Status, bool Zerado, bool Platinado, bool Abandonado,
    int? Nota, bool Favorito, string? Resenha, List<JogatinaDto> Jogatinas);
