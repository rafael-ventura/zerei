using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zerei.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CatalogoExpandido : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EhDlc",
                table: "Jogos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "JogoBaseId",
                table: "Jogos",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Metacritic",
                table: "Jogos",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TempoMedioHoras",
                table: "Jogos",
                type: "double precision",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "JogoPlataforma",
                columns: table => new
                {
                    JogosDisponiveisId = table.Column<int>(type: "integer", nullable: false),
                    PlataformasDisponiveisId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JogoPlataforma", x => new { x.JogosDisponiveisId, x.PlataformasDisponiveisId });
                    table.ForeignKey(
                        name: "FK_JogoPlataforma_Jogos_JogosDisponiveisId",
                        column: x => x.JogosDisponiveisId,
                        principalTable: "Jogos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JogoPlataforma_Plataformas_PlataformasDisponiveisId",
                        column: x => x.PlataformasDisponiveisId,
                        principalTable: "Plataformas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Jogos_JogoBaseId",
                table: "Jogos",
                column: "JogoBaseId");

            migrationBuilder.CreateIndex(
                name: "IX_JogoPlataforma_PlataformasDisponiveisId",
                table: "JogoPlataforma",
                column: "PlataformasDisponiveisId");

            migrationBuilder.AddForeignKey(
                name: "FK_Jogos_Jogos_JogoBaseId",
                table: "Jogos",
                column: "JogoBaseId",
                principalTable: "Jogos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Jogos_Jogos_JogoBaseId",
                table: "Jogos");

            migrationBuilder.DropTable(
                name: "JogoPlataforma");

            migrationBuilder.DropIndex(
                name: "IX_Jogos_JogoBaseId",
                table: "Jogos");

            migrationBuilder.DropColumn(
                name: "EhDlc",
                table: "Jogos");

            migrationBuilder.DropColumn(
                name: "JogoBaseId",
                table: "Jogos");

            migrationBuilder.DropColumn(
                name: "Metacritic",
                table: "Jogos");

            migrationBuilder.DropColumn(
                name: "TempoMedioHoras",
                table: "Jogos");
        }
    }
}
