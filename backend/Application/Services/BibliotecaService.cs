using Microsoft.EntityFrameworkCore;
using Zerei.Application.Dtos;
using Zerei.Domain.Entities;
using Zerei.Domain.Enums;
using Zerei.Infrastructure.Data;

namespace Zerei.Application.Services;

public class BibliotecaService
{
    private readonly ZereiDbContext _db;
    public BibliotecaService(ZereiDbContext db) => _db = db;

    public async Task<List<UsuarioJogoDto>> ListarAsync(int usuarioId, StatusJogo? status)
    {
        var query = CarregarCompleto(usuarioId);
        if (status.HasValue) query = query.Where(uj => uj.Status == status.Value);
        var lista = await query.OrderByDescending(uj => uj.AtualizadoEm).ToListAsync();
        return lista.Select(Mapeamentos.ToDto).ToList();
    }

    public async Task<UsuarioJogoDto?> ObterPorJogoAsync(int usuarioId, int jogoId)
    {
        var uj = await CarregarCompleto(usuarioId).FirstOrDefaultAsync(x => x.JogoId == jogoId);
        return uj is null ? null : Mapeamentos.ToDto(uj);
    }

    public async Task<UsuarioJogoDto> MarcarAsync(int usuarioId, int jogoId, StatusJogo status)
    {
        _ = await _db.Jogos.FindAsync(jogoId) ?? throw new KeyNotFoundException("Jogo não encontrado.");

        var uj = await _db.UsuarioJogos.FirstOrDefaultAsync(x => x.UsuarioId == usuarioId && x.JogoId == jogoId);
        if (uj is null)
        {
            uj = new UsuarioJogo { UsuarioId = usuarioId, JogoId = jogoId, Status = status };
            _db.UsuarioJogos.Add(uj);
        }
        else
        {
            uj.Status = status;
            uj.AtualizadoEm = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync();
        return (await ObterPorJogoAsync(usuarioId, jogoId))!;
    }

    public async Task MarcarLoteAsync(int usuarioId, List<int> jogoIds, StatusJogo status)
    {
        if (jogoIds is null || jogoIds.Count == 0) return;

        var existentes = await _db.UsuarioJogos
            .Where(x => x.UsuarioId == usuarioId && jogoIds.Contains(x.JogoId))
            .ToDictionaryAsync(x => x.JogoId);

        var jogosValidos = await _db.Jogos.Where(j => jogoIds.Contains(j.Id)).Select(j => j.Id).ToListAsync();
        foreach (var jogoId in jogosValidos)
        {
            if (existentes.TryGetValue(jogoId, out var uj))
            {
                uj.Status = status;
                uj.AtualizadoEm = DateTime.UtcNow;
            }
            else
            {
                _db.UsuarioJogos.Add(new UsuarioJogo { UsuarioId = usuarioId, JogoId = jogoId, Status = status });
            }
        }
        await _db.SaveChangesAsync();
    }

    public async Task<UsuarioJogoDto> AtualizarAsync(int usuarioId, int usuarioJogoId, AtualizarBibliotecaRequest req)
    {
        var uj = await CarregarCompleto(usuarioId).FirstOrDefaultAsync(x => x.Id == usuarioJogoId)
            ?? throw new KeyNotFoundException("Registro não encontrado.");

        if (req.Status.HasValue) uj.Status = req.Status.Value;
        if (req.Nota.HasValue) uj.Nota = Math.Clamp(req.Nota.Value, 0, 10);
        if (req.Favorito.HasValue) uj.Favorito = req.Favorito.Value;
        if (req.Resenha is not null) uj.Resenha = req.Resenha;
        uj.AtualizadoEm = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Mapeamentos.ToDto(uj);
    }

    public async Task RemoverAsync(int usuarioId, int usuarioJogoId)
    {
        var uj = await _db.UsuarioJogos.FirstOrDefaultAsync(x => x.Id == usuarioJogoId && x.UsuarioId == usuarioId)
            ?? throw new KeyNotFoundException("Registro não encontrado.");
        _db.UsuarioJogos.Remove(uj);
        await _db.SaveChangesAsync();
    }

    public async Task<JogatinaDto> AdicionarJogatinaAsync(int usuarioId, int usuarioJogoId, CriarJogatinaRequest req)
    {
        var uj = await _db.UsuarioJogos.FirstOrDefaultAsync(x => x.Id == usuarioJogoId && x.UsuarioId == usuarioId)
            ?? throw new KeyNotFoundException("Registro não encontrado.");

        var jogatina = new Jogatina
        {
            UsuarioJogoId = uj.Id,
            PlataformaId = req.PlataformaId,
            Ano = req.Ano,
            Horas = req.Horas,
            Status = req.Status,
            EhRejogada = req.EhRejogada,
            Observacao = req.Observacao
        };
        _db.Jogatinas.Add(jogatina);
        uj.AtualizadoEm = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var plataforma = req.PlataformaId is null ? null : await _db.Plataformas.FindAsync(req.PlataformaId);
        return new JogatinaDto(jogatina.Id, jogatina.PlataformaId, plataforma?.Nome,
            jogatina.Ano, jogatina.Horas, jogatina.Status, jogatina.EhRejogada, jogatina.Observacao);
    }

    public async Task RemoverJogatinaAsync(int usuarioId, int jogatinaId)
    {
        var jogatina = await _db.Jogatinas
            .Include(j => j.UsuarioJogo)
            .FirstOrDefaultAsync(j => j.Id == jogatinaId && j.UsuarioJogo.UsuarioId == usuarioId)
            ?? throw new KeyNotFoundException("Jogatina não encontrada.");
        _db.Jogatinas.Remove(jogatina);
        await _db.SaveChangesAsync();
    }

    private IQueryable<UsuarioJogo> CarregarCompleto(int usuarioId) =>
        _db.UsuarioJogos
            .Where(uj => uj.UsuarioId == usuarioId)
            .Include(uj => uj.Jogo).ThenInclude(j => j.Generos)
            .Include(uj => uj.Jogatinas).ThenInclude(j => j.Plataforma);
}
