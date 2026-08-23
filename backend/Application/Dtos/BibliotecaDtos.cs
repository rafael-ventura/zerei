using Zerei.Domain.Enums;

namespace Zerei.Application.Dtos;

public record MarcarRequest(int JogoId, StatusJogo Status);
public record MarcarLoteRequest(List<int> JogoIds, StatusJogo Status);
public record AtualizarBibliotecaRequest(StatusJogo? Status, int? Nota, bool? Favorito, string? Resenha);
public record CriarJogatinaRequest(int? PlataformaId, int? Ano, double? Horas, StatusJogo Status, bool EhRejogada, string? Observacao);
public record JogatinaDto(int Id, int? PlataformaId, string? Plataforma, int? Ano, double? Horas, StatusJogo Status, bool EhRejogada, string? Observacao);
public record UsuarioJogoDto(int Id, JogoDto Jogo, StatusJogo Status, int? Nota, bool Favorito, string? Resenha, List<JogatinaDto> Jogatinas);
