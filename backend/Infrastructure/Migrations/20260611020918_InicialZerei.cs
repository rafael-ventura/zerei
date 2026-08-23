using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Zerei.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InicialZerei : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Jogos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Ano = table.Column<int>(type: "integer", nullable: true),
                    CapaUrl = table.Column<string>(type: "text", nullable: true),
                    RawgId = table.Column<int>(type: "integer", nullable: true),
                    RawgSlug = table.Column<string>(type: "text", nullable: true),
                    Famoso = table.Column<bool>(type: "boolean", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Jogos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Plataformas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Slug = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Familia = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plataformas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Username = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    Email = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    SenhaHash = table.Column<string>(type: "text", nullable: false),
                    Bio = table.Column<string>(type: "text", nullable: true),
                    FotoUrl = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Generos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Slug = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    UsuarioId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Generos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Generos_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UsuarioJogos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    JogoId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Nota = table.Column<int>(type: "integer", nullable: true),
                    Favorito = table.Column<bool>(type: "boolean", nullable: false),
                    Resenha = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioJogos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UsuarioJogos_Jogos_JogoId",
                        column: x => x.JogoId,
                        principalTable: "Jogos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsuarioJogos_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GeneroJogo",
                columns: table => new
                {
                    GenerosId = table.Column<int>(type: "integer", nullable: false),
                    JogosId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeneroJogo", x => new { x.GenerosId, x.JogosId });
                    table.ForeignKey(
                        name: "FK_GeneroJogo_Generos_GenerosId",
                        column: x => x.GenerosId,
                        principalTable: "Generos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GeneroJogo_Jogos_JogosId",
                        column: x => x.JogosId,
                        principalTable: "Jogos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Jogatinas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioJogoId = table.Column<int>(type: "integer", nullable: false),
                    PlataformaId = table.Column<int>(type: "integer", nullable: true),
                    Ano = table.Column<int>(type: "integer", nullable: true),
                    Horas = table.Column<double>(type: "double precision", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    EhRejogada = table.Column<bool>(type: "boolean", nullable: false),
                    Observacao = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Jogatinas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Jogatinas_Plataformas_PlataformaId",
                        column: x => x.PlataformaId,
                        principalTable: "Plataformas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Jogatinas_UsuarioJogos_UsuarioJogoId",
                        column: x => x.UsuarioJogoId,
                        principalTable: "UsuarioJogos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GeneroJogo_JogosId",
                table: "GeneroJogo",
                column: "JogosId");

            migrationBuilder.CreateIndex(
                name: "IX_Generos_Slug",
                table: "Generos",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Generos_UsuarioId",
                table: "Generos",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Jogatinas_PlataformaId",
                table: "Jogatinas",
                column: "PlataformaId");

            migrationBuilder.CreateIndex(
                name: "IX_Jogatinas_UsuarioJogoId",
                table: "Jogatinas",
                column: "UsuarioJogoId");

            migrationBuilder.CreateIndex(
                name: "IX_Jogos_RawgId",
                table: "Jogos",
                column: "RawgId",
                unique: true,
                filter: "\"RawgId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Plataformas_Slug",
                table: "Plataformas",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioJogos_JogoId",
                table: "UsuarioJogos",
                column: "JogoId");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioJogos_UsuarioId_JogoId",
                table: "UsuarioJogos",
                columns: new[] { "UsuarioId", "JogoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Username",
                table: "Usuarios",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GeneroJogo");

            migrationBuilder.DropTable(
                name: "Jogatinas");

            migrationBuilder.DropTable(
                name: "Generos");

            migrationBuilder.DropTable(
                name: "Plataformas");

            migrationBuilder.DropTable(
                name: "UsuarioJogos");

            migrationBuilder.DropTable(
                name: "Jogos");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
