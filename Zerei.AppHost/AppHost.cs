var builder = DistributedApplication.CreateBuilder(args);

// Postgres continua nativo (serviço Windows existente com dados reais) —
// o Aspire aqui só orquestra o processo do backend e dá o dashboard de telemetria local.
builder.AddProject<Projects.backend>("backend");

builder.Build().Run();
