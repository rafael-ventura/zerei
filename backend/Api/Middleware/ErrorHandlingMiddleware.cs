namespace Zerei.Api.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _log;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> log)
    {
        _next = next;
        _log = log;
    }

    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (Exception ex)
        {
            var (code, msg) = ex switch
            {
                InvalidOperationException => (StatusCodes.Status400BadRequest, ex.Message),
                UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, ex.Message),
                KeyNotFoundException => (StatusCodes.Status404NotFound, ex.Message),
                _ => (StatusCodes.Status500InternalServerError, "Erro interno no servidor.")
            };

            if (code == StatusCodes.Status500InternalServerError)
                _log.LogError(ex, "Erro não tratado");

            ctx.Response.StatusCode = code;
            ctx.Response.ContentType = "application/json";
            await ctx.Response.WriteAsJsonAsync(new { erro = msg });
        }
    }
}
