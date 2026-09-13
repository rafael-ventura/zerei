/** Convenção de cor do próprio Metacritic: verde ≥75, amarelo 50-74, vermelho <50. */
export function corMetacritic(nota: number): string {
  if (nota >= 75) return '#6c3';
  if (nota >= 50) return '#fc3';
  return '#f00';
}

/** Mesma convenção de cor (verde/amarelo/vermelho), escalada pra nota RAWG (0-5). */
export function corNota5(nota: number): string {
  return corMetacritic(nota * 20);
}

/** Mesma convenção de cor, escalada pra nossa nota pessoal (0-10). */
export function corNota10(nota: number): string {
  return corMetacritic(nota * 10);
}
