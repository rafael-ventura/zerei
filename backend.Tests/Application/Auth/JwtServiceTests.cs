using Microsoft.Extensions.Configuration;
using Zerei.Application.Auth;
using Zerei.Domain.Entities;
using Xunit;

namespace Zerei.Tests.Application.Auth;

public class JwtServiceTests
{
    private static JwtService BuildService(string? secret = "unit-test-secret-key-at-least-32-chars-long")
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = secret,
                ["Jwt:Issuer"] = "zerei-tests",
                ["Jwt:Audience"] = "zerei-tests",
            })
            .Build();
        return new JwtService(config);
    }

    [Fact]
    public void GerarToken_ReturnsNonEmptyToken()
    {
        var service = BuildService();
        var usuario = new Usuario { Id = 1, Username = "rafael", Email = "rafael@example.com" };

        var token = service.GerarToken(usuario);

        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.Equal(3, token.Split('.').Length); // header.payload.signature
    }

    [Fact]
    public void GerarToken_MissingSecret_Throws()
    {
        var service = BuildService(secret: null);
        var usuario = new Usuario { Id = 1, Username = "rafael", Email = "rafael@example.com" };

        Assert.Throws<InvalidOperationException>(() => service.GerarToken(usuario));
    }
}
