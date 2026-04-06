# Fase 6 — Deploy & Polish

> **Referências**: `09-DEPLOY.md` (topologia), `08-PERFORMANCE.md` (targets)
> **Resultado esperado**: Ambos os apps online na Vercel com Lighthouse ≥ 90.

---

## 6.1 — Deploy apps/web

- [ ] Criar projeto na Vercel
- [ ] Root directory: `apps/web`
- [ ] Build command: `cd ../.. && pnpm turbo build --filter=web`
- [ ] Install command: `pnpm install`
- [ ] Env vars: `DATABASE_URL`
- [ ] Verificar que o site carrega com dados

---

## 6.2 — Deploy apps/admin

- [ ] Criar projeto separado na Vercel
- [ ] Root directory: `apps/admin`
- [ ] Build command: `cd ../.. && pnpm turbo build --filter=admin`
- [ ] Env vars: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`
- [ ] Verificar login + CRUD funcionando

---

## 6.3 — SEO & Open Graph

- [ ] Open Graph image (1200x630) com escudo Resenha + nome do time
- [ ] Metadata em `layout.tsx`:
  - `title`: "Resenha RFC — Futebol Amador"
  - `description`: "Site oficial do Resenha RFC..."
  - `og:image`, `twitter:card`
- [ ] Favicon gerado do logo
- [ ] `robots.txt` e `sitemap.xml`

---

## 6.4 — Lighthouse Audit

- [ ] Rodar Lighthouse em todas as páginas públicas
- [ ] Targets: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90
- [ ] Corrigir qualquer issue até atingir os targets

---

## 6.5 — Dark Mode Toggle

- [ ] Implementar toggle dark/light mode no Header (web)
- [ ] Salvar preferência em `localStorage`
- [ ] Dark mode é o padrão (tema principal já é dark)
- [ ] Light mode: inverter backgrounds e textos mantendo a identidade

---

## ✅ Checklist final

```bash
# Web: https://resenha.vercel.app ✅
# Admin: https://admin-resenha.vercel.app ✅
# Lighthouse: ≥ 90 em todas categorias ✅
# Login admin funciona ✅
# CRUD reflete no site público ✅
```
