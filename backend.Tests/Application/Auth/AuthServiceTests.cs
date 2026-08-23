using Microsoft.Extensions.Configuration;
using Zerei.Application.Auth;
using Zerei.Application.Dtos;
using Xunit;

namespace Zerei.Tests.Application.Auth;

public class AuthServiceTests
{
    private static AuthService BuildService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "unit-test-secret-key-at-least-32-chars-long",
                ["Jwt:Issuer"] = "zerei-tests",
                ["Jwt:Audience"] = "zerei-tests",
            })
            .Build();
        return new AuthService(TestDb.New(), new JwtService(config));
    }

    [Fact]
    public async Task RegistrarAsync_ValidRequest_CreatesUserAndReturnsToken()
    {
        var service = BuildService();
        var req = new RegistroRequest("Rafael", "rafael", "rafael@example.com", "senha123");

        var result = await service.RegistrarAsync(req);

        Assert.False(string.IsNullOrWhiteSpace(result.Token));
        Assert.Equal("rafael", result.Usuario.Username);
        Assert.Equal("rafael@example.com", result.Usuario.Email);
    }

    [Fact]
    public async Task RegistrarAsync_ShortPassword_Throws()
    {
        var service = BuildService();
        var req = new RegistroRequest("Rafael", "rafael", "rafael@example.com", "abc");

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.RegistrarAsync(req));
    }

    [Fact]
    public async Task RegistrarAsync_DuplicateEmail_Throws()
    {
        var service = BuildService();
        await service.RegistrarAsync(new RegistroRequest("Rafael", "rafael", "rafael@example.com", "senha123"));

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.RegistrarAsync(new RegistroRequest("Outro", "outro", "rafael@example.com", "senha456")));
    }

    [Fact]
    public async Task RegistrarAsync_DuplicateUsername_Throws()
    {
        var service = BuildService();
        await service.RegistrarAsync(new RegistroRequest("Rafael", "rafael", "rafael@example.com", "senha123"));

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.RegistrarAsync(new RegistroRequest("Outro", "rafael", "outro@example.com", "senha456")));
    }

    [Fact]
    public async Task LoginAsync_CorrectCredentials_ReturnsToken()
    {
        var service = BuildService();
        await service.RegistrarAsync(new RegistroRequest("Rafael", "rafael", "rafael@example.com", "senha123"));

        var result = await service.LoginAsync(new LoginRequest("rafael", "senha123"));

        Assert.False(string.IsNullOrWhiteSpace(result.Token));
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_Throws()
    {
        var service = BuildService();
        await service.RegistrarAsync(new RegistroRequest("Rafael", "rafael", "rafael@example.com", "senha123"));

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.LoginAsync(new LoginRequest("rafael", "senha-errada")));
    }

    [Fact]
    public async Task LoginAsync_UnknownUser_Throws()
    {
        var service = BuildService();

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.LoginAsync(new LoginRequest("ninguem", "senha123")));
    }

    [Fact]
    public async Task LoginAsync_ByEmail_AlsoWorks()
    {
        var service = BuildService();
        await service.RegistrarAsync(new RegistroRequest("Rafael", "rafael", "rafael@example.com", "senha123"));

        var result = await service.LoginAsync(new LoginRequest("rafael@example.com", "senha123"));

        Assert.False(string.IsNullOrWhiteSpace(result.Token));
    }
}
