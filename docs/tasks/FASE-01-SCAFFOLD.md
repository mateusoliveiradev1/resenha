# Fase 1 — Scaffold Monorepo

> **Referências**: `01-VISAO-GERAL.md` (stack), `02-ARQUITETURA.md` (estrutura), `03-DATABASE.md` (schema)
> **Resultado esperado**: Monorepo funcional com DB populado e todos os packages configurados.

---

## 1.1 — Inicializar Turborepo

- [ ] Rodar `pnpm dlx create-turbo@latest ./` (selecionar pnpm + Next.js)
- [ ] Limpar boilerplate: remover `apps/docs`, manter `apps/web`
- [ ] Criar `apps/admin/` com `npx create-next-app@latest ./` (TS, Tailwind v4, App Router, src/)
- [ ] Configurar `pnpm-workspace.yaml`:
  ```yaml
  packages:
    - "apps/*"
    - "packages/*"
  ```
- [ ] Configurar `turbo.json` com pipelines:
  - `build` → depende de `^build`
  - `dev` → persistent: true
  - `lint`, `test`, `test:e2e`

---

## 1.2 — Package `@resenha/db`

- [ ] Criar Neon database via **MCP** (`mcp-server-neon`), salvar `DATABASE_URL`
- [ ] Criar `packages/db/`
  - Instalar: `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`
  - `package.json` com `"name": "@resenha/db"`
- [ ] Schema `users.ts` — ver `03-DATABASE.md` seção users
- [ ] Schema `players.ts` — ver `03-DATABASE.md` seção players
- [ ] Schema `matches.ts` — ver `03-DATABASE.md` seção matches
- [ ] Schema `match-stats.ts` — ver `03-DATABASE.md` seção match_stats
- [ ] Schema `posts.ts` — ver `03-DATABASE.md` seção posts
- [ ] Schema `gallery.ts` — ver `03-DATABASE.md` seção gallery
- [ ] `client.ts` — Neon serverless pool + Drizzle instance export
- [ ] `drizzle.config.ts` + rodar `pnpm drizzle-kit push`
- [ ] `seed.ts`:
  - 1 admin user (email: admin@resenha.com, senha: admin123)
  - 12 jogadores fictícios (3 por posição)
  - 5 partidas (3 finalizadas, 1 ao vivo, 1 agendada)
  - Stats para as 3 partidas finalizadas
  - 3 blog posts (1 publicado, 2 rascunho)

---

## 1.3 — Package `@resenha/validators`

- [ ] `player.ts` — `CreatePlayerSchema`, `UpdatePlayerSchema`, `PlayerFilterSchema`
- [ ] `match.ts` — `CreateMatchSchema`, `UpdateMatchSchema`, `MatchFilterSchema`
- [ ] `post.ts` — `CreatePostSchema`, `UpdatePostSchema`
- [ ] `auth.ts` — `LoginSchema` (`{ email, password }`)
- [ ] `gallery.ts` — `UploadPhotoSchema`
- [ ] `stats.ts` — `UpsertMatchStatsSchema`
- [ ] `index.ts` — Barrel re-exports

---

## 1.4 — Package `@resenha/auth`

- [ ] `config.ts` — Auth.js edge-safe (JWT strategy, custom pages `/login`)
- [ ] `index.ts` — Full config + Drizzle adapter + callbacks (role no JWT/Session)
- [ ] `types.ts` — Extend `Session`, `JWT`, `User` com campo `role`

---

## 1.5 — Package `@resenha/config`

- [ ] `eslint/` — Shared ESLint flat config (strict rules)
- [ ] `typescript/` — Base `tsconfig.json` strict mode
- [ ] `tailwind/` — Preset com cores Resenha (ver `06-DESIGN-SYSTEM.md`)

---

## 1.6 — Assets

- [ ] Copiar logo para `apps/web/public/logo.png`
- [ ] Copiar logo para `apps/admin/public/logo.png`

---

## ✅ Checklist de validação

```bash
pnpm install          # instala tudo
pnpm turbo build      # build sem erros
pnpm --filter @resenha/db seed  # popula banco
```
