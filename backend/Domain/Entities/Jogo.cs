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

    /// <summary>Nota Metacritic (0-100), vinda da RAWG.</summary>
    public int? Metacritic { get; set; }

    /// <summary>Tempo médio pra zerar, em horas (média da comunidade RAWG/Steam) — não é o tempo pessoal do usuário.</summary>
    public double? TempoMedioHoras { get; set; }

    /// <summary>Nota média dos usuários da RAWG (0-5), agregada de milhares de avaliações — distinta do Metacritic (crítica especializada).</summary>
    public double? NotaComunidade { get; set; }
    public int? NotaComunidadeContagem { get; set; }

    /// <summary>Marca que já consultamos a RAWG por uma nota (mesmo que ela não tenha retornado nenhuma) — evita reprocessar pra sempre jogos sem avaliações suficientes.</summary>
    public DateTime? NotaComunidadeVerificadaEm { get; set; }

    /// <summary>Se true, este registro é uma DLC/expansão de <see cref="JogoBase"/>.</summary>
    public bool EhDlc { get; set; }
    public int? JogoBaseId { get; set; }
    public Jogo? JogoBase { get; set; }
    public List<Jogo> Dlcs { get; set; } = new();

    public List<Genero> Generos { get; set; } = new();

    /// <summary>Plataformas em que o jogo foi lançado (dado de catálogo, vindo da RAWG) — distinto da plataforma pessoal em <see cref="Jogatina"/>.</summary>
    public List<Plataforma> PlataformasDisponiveis { get; set; } = new();

    public List<UsuarioJogo> UsuarioJogos { get; set; } = new();
}
