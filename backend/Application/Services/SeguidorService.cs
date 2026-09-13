using Microsoft.EntityFrameworkCore;
using Zerei.Application.Dtos;
using Zerei.Domain.Entities;
using Zerei.Infrastructure.Data;

namespace Zerei.Application.Services;

public class SeguidorService
{
    private readonly ZereiDbContext _db;
    public SeguidorService(ZereiDbContext db) => _db = db;

    public async Task SeguirAsync(int usuarioId, int seguidoId)
    {
        if (usuarioId == seguidoId)
            throw new InvalidOperationException("Você não pode seguir a si mesmo.");

        _ = await _db.Usuarios.FindAsync(seguidoId) ?? throw new KeyNotFoundException("Usuário não encontrado.");

        var jaSegue = await _db.Seguidores.AnyAsync(s => s.SeguidorId == usuarioId && s.SeguidoId == seguidoId);
        if (jaSegue) return;

        _db.Seguidores.Add(new Seguidor { SeguidorId = usuarioId, SeguidoId = seguidoId });
        await _db.SaveChangesAsync();
    }

    public async Task DeixarDeSeguirAsync(int usuarioId, int seguidoId)
    {
        var vinculo = await _db.Seguidores.FirstOrDefaultAsync(s => s.SeguidorId == usuarioId && s.SeguidoId == seguidoId);
        if (vinculo is null) return;
        _db.Seguidores.Remove(vinculo);
        await _db.SaveChangesAsync();
    }

    /// <summary>Quem segue o usuário.</summary>
    public async Task<List<UsuarioPublicoDto>> SeguidoresAsync(int usuarioId) =>
        await _db.Seguidores.Where(s => s.SeguidoId == usuarioId)
            .Include(s => s.SeguidorUsuario)
            .OrderByDescending(s => s.CriadoEm)
            .Select(s => ToDto(s.SeguidorUsuario))
            .ToListAsync();

    /// <summary>Quem o usuário segue.</summary>
    public async Task<List<UsuarioPublicoDto>> SeguindoAsync(int usuarioId) =>
        await _db.Seguidores.Where(s => s.SeguidorId == usuarioId)
            .Include(s => s.SeguidoUsuario)
            .OrderByDescending(s => s.CriadoEm)
            .Select(s => ToDto(s.SeguidoUsuario))
            .ToListAsync();

    public async Task<bool> SegueAsync(int usuarioId, int seguidoId) =>
        await _db.Seguidores.AnyAsync(s => s.SeguidorId == usuarioId && s.SeguidoId == seguidoId);

    private static UsuarioPublicoDto ToDto(Usuario u) => new(u.Id, u.Nome, u.Username, u.FotoUrl, u.Bio);
}
