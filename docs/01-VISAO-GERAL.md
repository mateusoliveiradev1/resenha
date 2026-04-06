# 01 — Visão Geral

## Projeto
Site + Blog + Admin Panel para o **Resenha RFC**, time de futebol amador (futsal + campo).

## Módulos

| Módulo | Público | Propósito |
|--------|---------|-----------|
| `apps/web` | Visitantes, torcedores | Site público: landing, elenco, jogos, blog, galeria, stats |
| `apps/admin` | Staff do time | Painel protegido: CRUD jogadores, partidas, posts, galeria |

## Princípios

- **Modular** — Turborepo monorepo, packages reutilizáveis
- **SDD** — Schema-Driven Development (Zod em toda input)
- **TDD** — Vitest para unit/component tests
- **E2E** — Playwright para flows completos
- **Security-first** — Auth.js RBAC, CSP, rate limiting
- **Performance extrema** — PPR, Cache Components, <100kb JS

## Tech Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Monorepo | Turborepo + pnpm | latest |
| Framework | Next.js | 16.x |
| Linguagem | TypeScript | 5.x (strict) |
| Banco | Neon Postgres | Serverless (MCP) |
| ORM | Drizzle ORM | latest |
| Auth | Auth.js | v5 |
| Validação | Zod | latest |
| Styling | Tailwind CSS | v4 |
| Componentes | Radix UI + CVA | latest |
| Animações | Framer Motion | latest |
| Testes Unit | Vitest | latest |
| Testes E2E | Playwright | latest |
| Deploy | Vercel | — |
| Icons | Lucide React | latest |
| Fonts | Inter + Outfit | Google Fonts |
