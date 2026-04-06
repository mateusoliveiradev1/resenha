# 08 — Performance & Caching

## Estratégias por Página

| Página | Estratégia | Revalidação |
|--------|-----------|-------------|
| Landing | PPR (static shell + dynamic) | 60s (countdown) |
| Elenco | `use cache` | On-demand (revalidatePath após CRUD) |
| Jogos | `use cache` | On-demand |
| Blog lista | `use cache` | On-demand (após publish) |
| Blog post | SSG + ISR | `revalidatePath` on update |
| Estatísticas | `use cache` | On-demand |
| Galeria | `use cache` | On-demand |
| Admin | Sem cache | Sempre fresh |

## Targets

| Métrica | Target |
|---------|--------|
| LCP | < 1.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| TTFB | < 200ms |
| Lighthouse | ≥ 90 todas categorias |
| JS First Load | < 100kb |

## Técnicas

- **PPR** (Partial Pre-Rendering) na landing page
- **`use cache`** directive do Next.js 16 para dados semi-estáticos
- **Dynamic imports** para lightbox e rich text editor
- **`next/image`** com blur placeholder e srcSet
- **`next/font/google`** com font subset (Inter + Outfit)
- **`@next/bundle-analyzer`** para monitorar bundle
- **Turbopack** para dev builds instantâneos
