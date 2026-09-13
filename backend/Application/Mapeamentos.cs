using Zerei.Application.Dtos;
using Zerei.Domain.Entities;

namespace Zerei.Application;

/// <summary>Conversões entidade → DTO reutilizadas pelos serviços.</summary>
public static class Mapeamentos
{
    public static JogoDto ToDto(Jogo j) =>
        new(j.Id, j.Nome, j.Ano, j.CapaUrl, j.Generos?.Select(g => g.Nome).ToList() ?? new(), j.Metacritic, j.TempoMedioHoras,
            j.PlataformasDisponiveis?.Select(p => p.Nome).ToList() ?? new(),
            j.Dlcs?.Select(d => new DlcResumoDto(d.Id, d.Nome, d.CapaUrl)).ToList() ?? new());

    public static JogatinaDto ToDto(Jogatina j) =>
        new(j.Id, j.PlataformaId, j.Plataforma?.Nome, j.Ano, j.Horas, j.Status,
            j.Zerado, j.Platinado, j.Abandonado, j.EhRejogada, j.Observacao);

    public static UsuarioJogoDto ToDto(UsuarioJogo uj) =>
        new(uj.Id, ToDto(uj.Jogo), uj.Status, uj.Zerado, uj.Platinado, uj.Abandonado, uj.Nota, uj.Favorito, uj.Resenha,
            uj.Jogatinas?.OrderByDescending(x => x.Ano).Select(ToDto).ToList() ?? new());
}
