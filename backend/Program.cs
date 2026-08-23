using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Zerei.Api.Middleware;
using Zerei.Application.Auth;
using Zerei.Application.Services;
using Zerei.Infrastructure.Data;
using Zerei.Infrastructure.External;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Banco
builder.Services.AddDbContext<ZereiDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

// RAWG (opcional — sem ApiKey, usa só o catálogo local)
var rawgOptions = new RawgOptions
{
    ApiKey = builder.Configuration["Rawg:ApiKey"],
    BaseUrl = builder.Configuration["Rawg:BaseUrl"] ?? "https://api.rawg.io/api"
};
builder.Services.AddSingleton(rawgOptions);
builder.Services.AddHttpClient<RawgService>();

// Serviços de aplicação
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<CatalogoService>();
builder.Services.AddScoped<BibliotecaService>();
builder.Services.AddScoped<PerfilService>();

// Autenticação JWT
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? "zerei-chave-de-desenvolvimento-troque-em-producao-0123456789";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "zerei",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "zerei",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });
builder.Services.AddAuthorization();

// CORS para o front Angular
builder.Services.AddCors(o => o.AddPolicy("frontend", p =>
    p.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

// Migrations + seed na subida
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ZereiDbContext>();
    db.Database.Migrate();
    await SeedData.SeedAsync(db);

    if (!string.IsNullOrWhiteSpace(rawgOptions.ApiKey))
    {
        try
        {
            var catalogo = scope.ServiceProvider.GetRequiredService<CatalogoService>();
            var n = await catalogo.EnriquecerCapasAsync();
            app.Logger.LogInformation("RAWG: {N} capas preenchidas.", n);
        }
        catch (Exception ex)
        {
            app.Logger.LogWarning(ex, "Não foi possível enriquecer capas via RAWG.");
        }
    }
}

app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
