namespace Zerei.Application.Dtos;

public record DistribuicaoItem(string Rotulo, int Quantidade);

public record EstatisticasDto(
    int TotalJogos,
    int Jogando,
    int Zerados,
    int Platinados,
    int Abandonados,
    int QueroJogar,
    double TotalHoras,
    double? NotaMedia,
    string? PlataformaFavorita,
    string? GeneroFavorito,
    List<DistribuicaoItem> PorFamiliaPlataforma,
    List<DistribuicaoItem> PorStatus
);

public record PerfilDto(UsuarioResumoDto Usuario, EstatisticasDto Estatisticas, List<UsuarioJogoDto> Favoritos);

public record PerfilPublicoDto(
    UsuarioPublicoDto Usuario, EstatisticasDto Estatisticas, List<UsuarioJogoDto> Favoritos,
    int Seguidores, int Seguindo, bool VoceSegue);
