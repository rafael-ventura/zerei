using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zerei.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NotaComunidade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "NotaComunidade",
                table: "Jogos",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NotaComunidadeContagem",
                table: "Jogos",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NotaComunidade",
                table: "Jogos");

            migrationBuilder.DropColumn(
                name: "NotaComunidadeContagem",
                table: "Jogos");
        }
    }
}
