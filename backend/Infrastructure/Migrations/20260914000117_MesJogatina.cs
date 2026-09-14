using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zerei.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MesJogatina : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Mes",
                table: "Jogatinas",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Mes",
                table: "Jogatinas");
        }
    }
}
