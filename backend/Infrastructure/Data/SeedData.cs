using Microsoft.EntityFrameworkCore;
using Zerei.Domain.Entities;

namespace Zerei.Infrastructure.Data;

/// <summary>
/// Seed idempotente: gêneros, plataformas e um catálogo curado de jogos famosos.
/// As capas (CapaUrl) ficam nulas até serem enriquecidas pela RAWG, se configurada.
/// </summary>
public static class SeedData
{
    public static async Task SeedAsync(ZereiDbContext db)
    {
        await SeedGenerosAsync(db);
        await SeedPlataformasAsync(db);
        await SeedJogosAsync(db);
        await SeedJogosPessoaisAsync(db);
    }

    private static readonly (string Slug, string Nome)[] Generos =
    {
        ("acao", "Ação"),
        ("aventura", "Aventura"),
        ("rpg", "RPG"),
        ("jrpg", "JRPG"),
        ("plataforma", "Plataforma"),
        ("fps", "Tiro (FPS)"),
        ("estrategia", "Estratégia"),
        ("puzzle", "Puzzle"),
        ("corrida", "Corrida"),
        ("esporte", "Esporte"),
        ("luta", "Luta"),
        ("terror", "Terror"),
        ("mundo-aberto", "Mundo Aberto"),
        ("indie", "Indie"),
        ("metroidvania", "Metroidvania"),
        ("roguelike", "Roguelike"),
        ("simulacao", "Simulação"),
        ("stealth", "Stealth"),
        ("soulslike", "Soulslike"),
    };

    private static readonly (string Slug, string Nome, string Familia)[] Plataformas =
    {
        ("pc", "PC", "PC"),
        ("ps1", "PlayStation", "PlayStation"),
        ("ps2", "PlayStation 2", "PlayStation"),
        ("ps3", "PlayStation 3", "PlayStation"),
        ("ps4", "PlayStation 4", "PlayStation"),
        ("ps5", "PlayStation 5", "PlayStation"),
        ("psp", "PSP", "PlayStation"),
        ("ps-vita", "PS Vita", "PlayStation"),
        ("nes", "NES", "Nintendo"),
        ("snes", "Super Nintendo", "Nintendo"),
        ("n64", "Nintendo 64", "Nintendo"),
        ("gamecube", "GameCube", "Nintendo"),
        ("wii", "Wii", "Nintendo"),
        ("wii-u", "Wii U", "Nintendo"),
        ("switch", "Nintendo Switch", "Nintendo"),
        ("gb", "Game Boy", "Nintendo"),
        ("gba", "Game Boy Advance", "Nintendo"),
        ("nds", "Nintendo DS", "Nintendo"),
        ("3ds", "Nintendo 3DS", "Nintendo"),
        ("xbox", "Xbox", "Xbox"),
        ("xbox-360", "Xbox 360", "Xbox"),
        ("xbox-one", "Xbox One", "Xbox"),
        ("xbox-series", "Xbox Series X|S", "Xbox"),
        ("mega-drive", "Mega Drive", "Sega"),
        ("dreamcast", "Dreamcast", "Sega"),
        ("mobile", "Mobile", "Mobile"),
    };

    private static readonly (string Nome, int Ano, string[] Generos)[] Jogos =
    {
        ("The Legend of Zelda: Ocarina of Time", 1998, new[] { "aventura", "acao" }),
        ("The Legend of Zelda: Breath of the Wild", 2017, new[] { "aventura", "mundo-aberto", "acao" }),
        ("The Legend of Zelda: Tears of the Kingdom", 2023, new[] { "aventura", "mundo-aberto" }),
        ("Super Mario 64", 1996, new[] { "plataforma" }),
        ("Super Mario Odyssey", 2017, new[] { "plataforma" }),
        ("Super Mario World", 1990, new[] { "plataforma" }),
        ("Chrono Trigger", 1995, new[] { "jrpg", "rpg" }),
        ("Final Fantasy VI", 1994, new[] { "jrpg", "rpg" }),
        ("Final Fantasy VII", 1997, new[] { "jrpg", "rpg" }),
        ("Final Fantasy X", 2001, new[] { "jrpg", "rpg" }),
        ("Elden Ring", 2022, new[] { "rpg", "soulslike", "mundo-aberto" }),
        ("Dark Souls", 2011, new[] { "rpg", "soulslike", "acao" }),
        ("Bloodborne", 2015, new[] { "rpg", "soulslike", "acao" }),
        ("Sekiro: Shadows Die Twice", 2019, new[] { "acao", "soulslike" }),
        ("The Witcher 3: Wild Hunt", 2015, new[] { "rpg", "mundo-aberto" }),
        ("Red Dead Redemption 2", 2018, new[] { "acao", "mundo-aberto", "aventura" }),
        ("Grand Theft Auto V", 2013, new[] { "acao", "mundo-aberto" }),
        ("God of War", 2018, new[] { "acao", "aventura" }),
        ("God of War Ragnarök", 2022, new[] { "acao", "aventura" }),
        ("Marvel's Spider-Man", 2018, new[] { "acao", "mundo-aberto" }),
        ("The Last of Us", 2013, new[] { "acao", "aventura", "terror" }),
        ("The Last of Us Part II", 2020, new[] { "acao", "aventura" }),
        ("Uncharted 4: A Thief's End", 2016, new[] { "acao", "aventura" }),
        ("Horizon Zero Dawn", 2017, new[] { "rpg", "mundo-aberto", "acao" }),
        ("Hollow Knight", 2017, new[] { "metroidvania", "indie", "plataforma" }),
        ("Celeste", 2018, new[] { "plataforma", "indie" }),
        ("Hades", 2020, new[] { "roguelike", "indie", "acao" }),
        ("Stardew Valley", 2016, new[] { "simulacao", "indie", "rpg" }),
        ("Undertale", 2015, new[] { "rpg", "indie" }),
        ("Cuphead", 2017, new[] { "acao", "indie", "plataforma" }),
        ("Sea of Stars", 2023, new[] { "jrpg", "indie", "rpg" }),
        ("Minecraft", 2011, new[] { "aventura", "simulacao", "mundo-aberto" }),
        ("Terraria", 2011, new[] { "aventura", "indie", "simulacao" }),
        ("Portal 2", 2011, new[] { "puzzle", "fps" }),
        ("Half-Life 2", 2004, new[] { "fps", "acao" }),
        ("DOOM", 2016, new[] { "fps", "acao" }),
        ("Counter-Strike: Global Offensive", 2012, new[] { "fps" }),
        ("Resident Evil 4", 2005, new[] { "terror", "acao" }),
        ("Silent Hill 2", 2001, new[] { "terror" }),
        ("Metal Gear Solid", 1998, new[] { "acao", "stealth" }),
        ("Sonic the Hedgehog 2", 1992, new[] { "plataforma" }),
        ("Pokémon Red", 1996, new[] { "jrpg", "rpg" }),
        ("Pokémon Gold", 1999, new[] { "jrpg", "rpg" }),
        ("Super Smash Bros. Ultimate", 2018, new[] { "luta" }),
        ("Street Fighter II", 1991, new[] { "luta" }),
        ("Mortal Kombat 11", 2019, new[] { "luta" }),
        ("Mario Kart 8 Deluxe", 2017, new[] { "corrida" }),
        ("Gran Turismo 7", 2022, new[] { "corrida", "simulacao" }),
        ("Death Stranding", 2019, new[] { "acao", "aventura" }),
        ("Cyberpunk 2077", 2020, new[] { "rpg", "mundo-aberto", "fps" }),
        ("Baldur's Gate 3", 2023, new[] { "rpg", "estrategia" }),
        ("Disco Elysium", 2019, new[] { "rpg", "indie" }),
    };

    private static async Task SeedGenerosAsync(ZereiDbContext db)
    {
        var existentes = await db.Generos.Select(g => g.Slug).ToListAsync();
        var novos = Generos.Where(g => !existentes.Contains(g.Slug))
            .Select(g => new Genero { Slug = g.Slug, Nome = g.Nome });
        if (novos.Any())
        {
            db.Generos.AddRange(novos);
            await db.SaveChangesAsync();
        }
    }

    private static async Task SeedPlataformasAsync(ZereiDbContext db)
    {
        var existentes = await db.Plataformas.Select(p => p.Slug).ToListAsync();
        var novas = Plataformas.Where(p => !existentes.Contains(p.Slug))
            .Select(p => new Plataforma { Slug = p.Slug, Nome = p.Nome, Familia = p.Familia });
        if (novas.Any())
        {
            db.Plataformas.AddRange(novas);
            await db.SaveChangesAsync();
        }
    }

    private static async Task SeedJogosAsync(ZereiDbContext db)
    {
        var generosPorSlug = await db.Generos.ToDictionaryAsync(g => g.Slug);
        var nomesExistentes = await db.Jogos.Select(j => j.Nome).ToListAsync();
        var existentesSet = nomesExistentes.ToHashSet();

        var novos = new List<Jogo>();
        foreach (var (nome, ano, generoSlugs) in Jogos)
        {
            if (existentesSet.Contains(nome)) continue;
            var jogo = new Jogo { Nome = nome, Ano = ano, Famoso = true };
            foreach (var slug in generoSlugs)
                if (generosPorSlug.TryGetValue(slug, out var genero))
                    jogo.Generos.Add(genero);
            novos.Add(jogo);
        }

        if (novos.Count > 0)
        {
            db.Jogos.AddRange(novos);
            await db.SaveChangesAsync();
        }
    }

    /// <summary>Jogos do backlog pessoal (não aparecem no grid de onboarding, só ficam no catálogo para marcação via biblioteca).</summary>
    private static readonly (string Nome, int Ano, string[] Generos)[] JogosBacklogPessoal =
    {
        ("Persona 5 Royal", 2019, new[] { "jrpg", "rpg" }),
        ("Digimon Story: Time Stranger", 2025, new[] { "jrpg", "rpg" }),
        ("Final Fantasy X-2", 2003, new[] { "jrpg", "rpg" }),
    };

    private static async Task SeedJogosPessoaisAsync(ZereiDbContext db)
    {
        var generosPorSlug = await db.Generos.ToDictionaryAsync(g => g.Slug);
        var existentesSet = (await db.Jogos.Select(j => j.Nome).ToListAsync()).ToHashSet();

        var novos = new List<Jogo>();
        foreach (var (nome, ano, generoSlugs) in JogosBacklogPessoal)
        {
            if (existentesSet.Contains(nome)) continue;
            var jogo = new Jogo { Nome = nome, Ano = ano, Famoso = false };
            foreach (var slug in generoSlugs)
                if (generosPorSlug.TryGetValue(slug, out var genero))
                    jogo.Generos.Add(genero);
            novos.Add(jogo);
        }

        if (novos.Count > 0)
        {
            db.Jogos.AddRange(novos);
            await db.SaveChangesAsync();
        }
    }
}
