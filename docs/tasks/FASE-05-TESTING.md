# Fase 5 — Testing & Security

> **Referências**: `05-AUTH-SEGURANCA.md` (security checklist), `04-API-CONTRACTS.md` (o que testar)
> **Resultado esperado**: Suite de testes passando + segurança configurada.

---

## 5.1 — Unit Tests com Vitest (TDD)

- [ ] Configurar Vitest no monorepo (`vitest.workspace.ts`)
- [ ] Tests `@resenha/validators`:
  - Testar TODOS os schemas Zod (inputs válidos e inválidos)
  - `CreatePlayerSchema`: nome obrigatório, posição válida, número > 0
  - `CreateMatchSchema`: data obrigatória, tipo válido, etc.
  - `LoginSchema`: email válido, senha min 6 chars
- [ ] Tests utilities:
  - `slugify("Título do Post")` → `"titulo-do-post"`
  - `formatDate(date)` → formato brasileiro
  - `calcReadingTime("texto com 400 palavras")` → `2`
  - `cn("base", conditional)` → classes mergeadas

---

## 5.2 — Component Tests

- [ ] Tests `Button` — renderiza, variantes alteram classes, onClick funciona
- [ ] Tests `Card` — renderiza children, variantes glass/elevated
- [ ] Tests `Badge` — renderiza texto, cor correta por variante
- [ ] Tests `PlayerCard` — renderiza nome, posição, número
- [ ] Tests `MatchCard` — renderiza placar, logos, badge resultado
- [ ] Tests `PostCard` — renderiza título, excerpt, badge categoria

---

## 5.3 — E2E com Playwright

- [ ] Configurar `playwright.config.ts` na raiz
- [ ] **Flow público**: landing → clicar "Elenco" → filtrar por posição → clicar "Jogos" → filtrar tipo → clicar "Blog" → abrir post → galeria → stats
- [ ] **Flow admin**: abrir /login → login com credenciais → criar jogador → salvar → verificar na DataTable → ir em partidas → criar partida → criar post → verificar no site público
- [ ] **Responsividade**: rodar flows em viewports 375px, 768px, 1440px

---

## 5.4 — Security Hardening

- [ ] Security headers no `next.config.ts` de ambos os apps:
  ```js
  headers: [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  ]
  ```
- [ ] Rate limiting nas Server Actions do admin (`next-rate-limit` ou implementação custom)
- [ ] T3 Env — criar `env.ts` validando:
  - `DATABASE_URL` (obrigatório)
  - `AUTH_SECRET` (obrigatório no admin)
  - `AUTH_URL` (obrigatório no admin)

---

## ✅ Checklist de validação

```bash
pnpm turbo test                    # Vitest unit + component
pnpm turbo test:e2e                # Playwright E2E
# Todos os tests devem passar ✅
```
