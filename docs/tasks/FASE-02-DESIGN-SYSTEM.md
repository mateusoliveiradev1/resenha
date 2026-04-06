# Fase 2 — Design System (`@resenha/ui`)

> **Referências**: `06-DESIGN-SYSTEM.md` (cores, tipografia, efeitos, componentes)
> **Resultado esperado**: Package `@resenha/ui` com todos componentes exportados e prontos para uso.

---

## 2.1 — Primitives

- [ ] `Button` — variantes: primary, secondary, ghost, destructive; sizes: sm, md, lg (usar CVA)
- [ ] `Input` — types: text, password, search; estados: default, error, disabled
- [ ] `Card` — variantes: default, glass, elevated; sub-components: CardHeader, CardContent, CardFooter
- [ ] `Badge` — variantes: default, success, warning, danger, accent, gold
- [ ] `Modal` — baseado em Radix Dialog, overlay escuro, animação scale, close button
- [ ] `Avatar` — foto com fallback de iniciais, border accent, sizes: sm, md, lg
- [ ] `Tabs` — animated underline indicator, variantes: pills, underline

---

## 2.2 — Composites

- [ ] `DataTable` — props: columns, data, sorting, pagination, empty state, loading skeleton
- [ ] `FormField` — label + Input + mensagem de erro, integrado com validação Zod

---

## 2.3 — Layout

- [ ] `Header` — logo Resenha, nav links (Início, Elenco, Jogos, Blog, Galeria, Stats), hamburger mobile, background glassmorphism
- [ ] `Footer` — logo pequeno, links úteis, ícones redes sociais, "© 2025 Resenha RFC"
- [ ] `Sidebar` — admin nav (Dashboard, Jogadores, Partidas, Posts, Galeria, Config), collapsible, active state highlight, logo no topo
- [ ] `Container` — max-width 1280px, padding responsivo (px-4 sm:px-6 lg:px-8)

---

## 2.4 — Exports

- [ ] `index.ts` — barrel export de TODOS os componentes
- [ ] Verificar que `apps/web` e `apps/admin` conseguem importar `import { Button } from "@resenha/ui"`

---

## ✅ Checklist de validação

```bash
pnpm turbo build --filter=@resenha/ui   # build sem erros
# Importar um componente em apps/web e verificar renderização
```
