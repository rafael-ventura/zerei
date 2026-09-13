using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zerei.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class StatusFlags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Abandonado",
                table: "UsuarioJogos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Platinado",
                table: "UsuarioJogos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Zerado",
                table: "UsuarioJogos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Abandonado",
                table: "Jogatinas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Platinado",
                table: "Jogatinas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Zerado",
                table: "Jogatinas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            // Backfill: os valores antigos do enum StatusJogo (3=Zerado, 4=CemPorcento, 5=Platinado,
            // 6=Abandonado) viram flags booleanas; o enum em si fica reduzido a QueroJogar/Jogando/Jogado (0/1/2).
            // Precisa rodar antes de qualquer código novo ler a coluna "Status" com o enum já reduzido.
            migrationBuilder.Sql(
                """
                UPDATE "UsuarioJogos" SET "Zerado" = true WHERE "Status" IN (3, 4, 5);
                UPDATE "UsuarioJogos" SET "Platinado" = true WHERE "Status" IN (4, 5);
                UPDATE "UsuarioJogos" SET "Abandonado" = true WHERE "Status" = 6;
                UPDATE "UsuarioJogos" SET "Status" = 2 WHERE "Status" IN (3, 4, 5, 6);

                UPDATE "Jogatinas" SET "Zerado" = true WHERE "Status" IN (3, 4, 5);
                UPDATE "Jogatinas" SET "Platinado" = true WHERE "Status" IN (4, 5);
                UPDATE "Jogatinas" SET "Abandonado" = true WHERE "Status" = 6;
                UPDATE "Jogatinas" SET "Status" = 2 WHERE "Status" IN (3, 4, 5, 6);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Abandonado",
                table: "UsuarioJogos");

            migrationBuilder.DropColumn(
                name: "Platinado",
                table: "UsuarioJogos");

            migrationBuilder.DropColumn(
                name: "Zerado",
                table: "UsuarioJogos");

            migrationBuilder.DropColumn(
                name: "Abandonado",
                table: "Jogatinas");

            migrationBuilder.DropColumn(
                name: "Platinado",
                table: "Jogatinas");

            migrationBuilder.DropColumn(
                name: "Zerado",
                table: "Jogatinas");
        }
    }
}
