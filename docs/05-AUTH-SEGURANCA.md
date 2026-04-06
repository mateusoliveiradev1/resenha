# 05 — Auth & Segurança

## Auth Flow

1. Admin acessa `/login` → digita email + senha
2. Server Action chama Auth.js `signIn("credentials")`
3. Auth.js busca user no Neon → `bcrypt.compare(password, hash)`
4. Se válido: gera JWT com `{ id, email, role }` → set `httpOnly` cookie
5. `middleware.ts` protege todas as rotas exceto `/login`
6. Layout do admin faz check server-side: `if (role !== "ADMIN") redirect("/login")`

## RBAC

| Role | Permissões |
|------|-----------|
| `ADMIN` | CRUD tudo, gerenciar usuários |
| `EDITOR` | CRUD posts e galeria apenas |

## Auth.js Config Split

| Arquivo | Contexto | Conteúdo |
|---------|----------|----------|
| `config.ts` | Edge (middleware) | JWT strategy, pages, sem DB adapter |
| `index.ts` | Node (Server Actions) | Importa config + Drizzle adapter + callbacks |
| `types.ts` | Ambos | Extend Session/JWT/User com `role` |

## Security Checklist

| # | Camada | Implementação |
|---|--------|--------------|
| 1 | Auth | Auth.js v5 + bcrypt, JWT httpOnly sessions |
| 2 | RBAC | Roles no JWT, guard em middleware + layout |
| 3 | Input | Zod validation em TODA Server Action |
| 4 | CSRF | Tokens automáticos via Auth.js |
| 5 | Rate Limit | `next-rate-limit` nas mutations admin |
| 6 | Headers | CSP, HSTS, X-Frame-Options no `next.config.ts` |
| 7 | SQL | Drizzle ORM (prepared statements, zero SQL raw) |
| 8 | Env | T3 Env para validar env vars no startup |
| 9 | Upload | Validar tipo MIME + tamanho máximo |
