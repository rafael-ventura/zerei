using Microsoft.EntityFrameworkCore;
using Zerei.Domain.Entities;

namespace Zerei.Infrastructure.Data;

public class ZereiDbContext : DbContext
{
    public ZereiDbContext(DbContextOptions<ZereiDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Jogo> Jogos => Set<Jogo>();
    public DbSet<Genero> Generos => Set<Genero>();
    public DbSet<Plataforma> Plataformas => Set<Plataforma>();
    public DbSet<UsuarioJogo> UsuarioJogos => Set<UsuarioJogo>();
    public DbSet<Jogatina> Jogatinas => Set<Jogatina>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Usuario>(e =>
        {
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Nome).HasMaxLength(120);
            e.Property(u => u.Username).HasMaxLength(60);
            e.Property(u => u.Email).HasMaxLength(180);
        });

        mb.Entity<Genero>(e =>
        {
            e.HasIndex(g => g.Slug).IsUnique();
            e.Property(g => g.Nome).HasMaxLength(80);
            e.Property(g => g.Slug).HasMaxLength(80);
        });

        mb.Entity<Plataforma>(e =>
        {
            e.HasIndex(p => p.Slug).IsUnique();
            e.Property(p => p.Nome).HasMaxLength(80);
            e.Property(p => p.Slug).HasMaxLength(80);
            e.Property(p => p.Familia).HasMaxLength(40);
        });

        mb.Entity<Jogo>(e =>
        {
            e.Property(j => j.Nome).HasMaxLength(200);
            e.HasIndex(j => j.RawgId).IsUnique().HasFilter("\"RawgId\" IS NOT NULL");
        });

        mb.Entity<UsuarioJogo>(e =>
        {
            e.HasIndex(uj => new { uj.UsuarioId, uj.JogoId }).IsUnique();
            e.HasOne(uj => uj.Usuario)
                .WithMany(u => u.UsuarioJogos)
                .HasForeignKey(uj => uj.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(uj => uj.Jogo)
                .WithMany(j => j.UsuarioJogos)
                .HasForeignKey(uj => uj.JogoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        mb.Entity<Jogatina>(e =>
        {
            e.HasOne(j => j.UsuarioJogo)
                .WithMany(uj => uj.Jogatinas)
                .HasForeignKey(j => j.UsuarioJogoId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(j => j.Plataforma)
                .WithMany()
                .HasForeignKey(j => j.PlataformaId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
