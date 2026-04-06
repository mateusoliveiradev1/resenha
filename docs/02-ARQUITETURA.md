# 02 — Arquitetura Monorepo

## Estrutura de Pastas

```
resenha/
├── apps/
│   ├── web/                          # Site público (SSR/PPR)
│   │   ├── src/
│   │   │   ├── app/                  # App Router
│   │   │   │   ├── layout.tsx        # Root (fonts, metadata, Header+Footer)
│   │   │   │   ├── page.tsx          # Landing
│   │   │   │   ├── elenco/page.tsx
│   │   │   │   ├── jogos/page.tsx
│   │   │   │   ├── blog/page.tsx
│   │   │   │   ├── blog/[slug]/page.tsx
│   │   │   │   ├── galeria/page.tsx
│   │   │   │   └── estatisticas/page.tsx
│   │   │   ├── components/
│   │   │   │   ├── home/             # HeroSection, NextMatch, LatestResults
│   │   │   │   ├── elenco/           # PlayerCard, PlayerGrid, PlayerFilters
│   │   │   │   ├── jogos/            # MatchCard, MatchList, MatchFilters
│   │   │   │   ├── blog/             # PostCard, PostList
│   │   │   │   ├── galeria/          # PhotoGrid, LightboxModal
│   │   │   │   └── stats/            # RankingList, TopScorers
│   │   │   ├── actions/              # Server Actions (queries públicas)
│   │   │   └── lib/                  # Utils (cn, formatDate)
│   │   ├── public/logo.png           # Escudo Resenha (FIXO)
│   │   └── next.config.ts
│   │
│   └── admin/                        # Painel administrativo
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx        # Auth guard + Sidebar
│       │   │   ├── page.tsx          # Dashboard
│       │   │   ├── login/page.tsx
│       │   │   ├── jogadores/        # CRUD jogadores
│       │   │   ├── partidas/         # CRUD partidas + stats
│       │   │   ├── posts/            # CRUD posts (automação)
│       │   │   ├── galeria/          # Upload fotos
│       │   │   └── configuracoes/
│       │   ├── components/
│       │   ├── actions/              # Server Actions (mutations admin)
│       │   └── middleware.ts         # Auth middleware
│       ├── public/logo.png
│       └── next.config.ts
│
├── packages/
│   ├── ui/                           # @resenha/ui — Design System
│   │   └── src/
│   │       ├── primitives/           # Button, Input, Card, Badge, Modal, Avatar, Tabs
│   │       ├── composites/           # DataTable, FormField, FileUpload
│   │       ├── layout/               # Header, Footer, Sidebar, Container
│   │       └── index.ts
│   │
│   ├── db/                           # @resenha/db — Database
│   │   └── src/
│   │       ├── schema/               # Um arquivo por tabela
│   │       ├── client.ts             # Neon pool + Drizzle
│   │       ├── seed.ts
│   │       └── index.ts
│   │
│   ├── validators/                   # @resenha/validators — Zod Schemas
│   │   └── src/                      # player.ts, match.ts, post.ts, auth.ts...
│   │
│   ├── auth/                         # @resenha/auth — Auth.js config
│   │   └── src/                      # config.ts (edge), index.ts (full), types.ts
│   │
│   └── config/                       # @resenha/config — Shared configs
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/                 # Preset com cores Resenha
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Regras

1. Apps **nunca** importam de outras apps — só de `packages/`
2. Cada package tem `package.json` com nome `@resenha/xxx`
3. Workspace protocol: `"@resenha/ui": "workspace:*"`
4. Dev tools (ESLint, Prettier, TS) ficam na **raiz**
5. Framework deps (Next.js, Tailwind) ficam no **app**
6. Cada app gerencia suas **próprias env vars**
7. `turbo.json` define: `build` depende de `^build`, `dev` é persistent
