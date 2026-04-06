# 09 — Deploy

## Topologia

| App | URL | Plataforma |
|-----|-----|-----------|
| `apps/web` | `resenha.vercel.app` | Vercel |
| `apps/admin` | `admin-resenha.vercel.app` | Vercel |
| Database | Production branch | Neon Postgres |

## Configuração Vercel

- Cada app é um **deploy separado** na Vercel
- Root directory: `apps/web` ou `apps/admin`
- Build command: `cd ../.. && pnpm turbo build --filter=web` (ou admin)
- Install command: `pnpm install`
- Preview deploys automáticos por PR

## Env Vars (por app)

### apps/web
```
DATABASE_URL=postgresql://...
```

### apps/admin
```
DATABASE_URL=postgresql://...
AUTH_SECRET=<random-32-chars>
AUTH_URL=https://admin-resenha.vercel.app
```

## Turborepo Remote Cache

- Habilitado via Vercel (gratuito)
- Compartilha cache de build entre deploys e CI
