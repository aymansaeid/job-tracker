using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTracker.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddJobUpdateSuggestions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "JobUpdateSuggestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    MessageId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EmailSubject = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    JobTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SuggestedStage = table.Column<int>(type: "int", nullable: true),
                    SuggestedInterviewDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobUpdateSuggestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobUpdateSuggestions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_JobUpdateSuggestions_MessageId",
                table: "JobUpdateSuggestions",
                column: "MessageId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobUpdateSuggestions_UserId",
                table: "JobUpdateSuggestions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JobUpdateSuggestions");
        }
    }
}
