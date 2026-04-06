# 📐 Resenha RFC — Documentação do Projeto

> Cada arquivo é auto-contido. Qualquer IA lê o índice + o arquivo da fase atual.

## Documentação Técnica

| # | Arquivo | Conteúdo |
|---|---------|----------|
| 01 | [Visão Geral](./01-VISAO-GERAL.md) | Escopo, princípios, tech stack |
| 02 | [Arquitetura](./02-ARQUITETURA.md) | Monorepo, estrutura de pastas, regras |
| 03 | [Database Schema](./03-DATABASE.md) | Todas as tabelas, tipos, relações |
| 04 | [API Contracts](./04-API-CONTRACTS.md) | Server Actions, inputs, outputs, auth |
| 05 | [Auth & Segurança](./05-AUTH-SEGURANCA.md) | Auth flow, RBAC, security checklist |
| 06 | [Design System](./06-DESIGN-SYSTEM.md) | Cores, tipografia, efeitos, componentes |
| 07 | [Wireframes UI](./07-WIREFRAMES.md) | Layout de cada página (web + admin) |
| 08 | [Performance](./08-PERFORMANCE.md) | Caching, PPR, targets, técnicas |
| 09 | [Deploy](./09-DEPLOY.md) | Topologia, Vercel, Neon, env vars |

## Tasks de Execução

| # | Arquivo | Fase |
|---|---------|------|
| T1 | [Fase 1 — Scaffold](./tasks/FASE-01-SCAFFOLD.md) | Monorepo + DB + packages |
| T2 | [Fase 2 — Design System](./tasks/FASE-02-DESIGN-SYSTEM.md) | @resenha/ui completo |
| T3 | [Fase 3 — Site Público](./tasks/FASE-03-SITE-PUBLICO.md) | apps/web — todas as páginas |
| T4 | [Fase 4 — Admin Panel](./tasks/FASE-04-ADMIN-PANEL.md) | apps/admin — CRUD + dashboard |
| T5 | [Fase 5 — Testing & Security](./tasks/FASE-05-TESTING.md) | Vitest, Playwright, security |
| T6 | [Fase 6 — Deploy & Polish](./tasks/FASE-06-DEPLOY.md) | Vercel, SEO, Lighthouse |
