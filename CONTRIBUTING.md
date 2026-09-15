# Contribuindo

Projeto pessoal, mas aberto a ideias e PRs. Alguns padrões pra manter o histórico legível.

## Antes de commitar

- **Backend:** `dotnet test` (raiz do repo) precisa passar.
- **Frontend:** `npx tsc --noEmit` (dentro de `frontend-react/`) precisa sair limpo.
- Se a mudança envolve UI, teste manualmente no navegador antes de dar como pronto — os testes automatizados não substituem isso.

## Nunca commitar segredos

- A chave da RAWG (`Rawg:ApiKey`) **nunca** vai em `appsettings.json` nem em nenhum arquivo versionado — só via `dotnet user-secrets` (fica fora do repo, em `%APPDATA%`/`~/.microsoft/usersecrets`).
- Antes de um `git add -A` ou `git commit`, dá uma olhada no `git status`/`git diff` — principalmente se mexeu em `appsettings*.json` ou criou algum arquivo de config novo.
- Se um segredo for commitado por engano: **trocar a chave/senha primeiro**, revertê-lo do histórico depois — o commit sozinho não é o suficiente uma vez que já foi pro remoto.

## Mensagens de commit

Formato: `tipo(escopo): descrição curta em português, no imperativo`

Tipos usados no projeto: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`.

```
feat(catalogo): jogos parecidos na tela de detalhe
fix(front): corrige resenha sumindo por race condition
refactor(biblioteca): encapsula regra de flags de conclusão
```

- Assunto curto (uma linha, sem ponto final) dizendo **o quê**.
- Corpo opcional (linha em branco depois do assunto) explicando **por quê** — só quando o motivo não é óbvio pela mudança em si. Evite descrever linha por linha o que já dá pra ver no diff.

## Branches e PRs

Mudanças pequenas/próprias: direto em `master`. Contribuição externa: fork → branch com nome descritivo → PR contra `master`, seguindo o mesmo padrão de commit acima.

## Onde propor ideias

Melhorias e sugestões de funcionalidade vão nas [issues](../../issues) do GitHub, não no README — mantém a documentação principal enxuta e centraliza a discussão num lugar só.
