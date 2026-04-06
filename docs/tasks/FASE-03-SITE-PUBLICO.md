# Fase 3 — Site Público (`apps/web`)

> **Referências**: `07-WIREFRAMES.md` (layout), `06-DESIGN-SYSTEM.md` (componentes), `04-API-CONTRACTS.md` (queries)
> **Resultado esperado**: Site público completo com todas as páginas navegáveis e dados do banco.

---

## 3.1 — Layout Global

- [x] `layout.tsx` — fonts (Inter + Outfit via `next/font/google`), metadata SEO, `<Header />` + `<Footer />`
- [x] `globals.css` — CSS variables do design system, reset, utilities custom

---

## 3.2 — Landing Page (`/`)

- [x] `HeroSection` — escudo grande centralizado (next/image), "RESENHA RFC" em Outfit 800, subtítulo, 2 CTAs animados (Framer Motion scale-in)
- [x] `NextMatchBanner` — card glass com 🛡️ logo Resenha FIXO + 🏴 logo adversário (do banco) + countdown timer + data/hora/local
- [x] `LatestResults` — query últimas 3 partidas FINISHED, 3 cards horizontais com logos + placar + badge V(verde)/E(amarelo)/D(vermelho)
- [x] `LatestPosts` — query últimos 2 posts publicados, grid 2 colunas com PostCard

---

## 3.3 — Elenco (`/elenco`)

- [x] `page.tsx` — Server Component, query `getPlayers()`
- [x] `PlayerFilters` — Client Component, tabs de posição: GOL, DEF, MEI, ATA, TODOS
- [x] `PlayerCard`:
  - **Frente**: foto retangular estilo figurinha, número no canto, nome, apelido, badge posição
  - **Hover overlay**: escurece foto + mostra: ⚽ gols total, 🅰️ assists, 👟 jogos, 📅 idade (calculada de birth_date), pé preferido, altura
  - **Click**: modal/página com perfil completo + histórico de partidas

---

## 3.4 — Jogos (`/jogos`)

- [x] `page.tsx` — Server Component, query `getMatches()`
- [x] `MatchFilters` — Client Component, toggle: FUTSAL / CAMPO / TODOS
- [x] `MatchCard`:
  - Esquerda: 🛡️ logo Resenha (**FIXO**, sempre `/logo.png`)
  - Centro: placar `3 x 1` em fonte grande (Outfit 700)
  - Direita: 🏴 logo adversário (do banco `opponent_logo`). **Fallback**: círculo com iniciais do nome
  - Abaixo: data, local, badge tipo (FUTSAL/CAMPO), badge resultado (✅V / 🟡E / 🔴D)
  - Agendados: sem placar, mostra "AGENDADO" + data

---

## 3.5 — Blog (`/blog`)

- [x] `page.tsx` — query `getPosts({ published: true })`, filtro por categoria (NOTÍCIA/RESULTADO/CRÔNICA/BASTIDORES/TODOS)
- [x] `PostCard` — cover image, título, excerpt (auto-gerado), tempo leitura (auto), badge categoria
- [x] `[slug]/page.tsx` — query `getPostBySlug()`, rich content renderizado, se tiver `match_id` mostra link para a partida

---

## 3.6 — Galeria (`/galeria`)

- [x] `page.tsx` — query `getPhotos()`, grid masonry de fotos, filtro por partida
- [x] `LightboxModal` — modal fullscreen com navegação prev/next, caption, close

---

## 3.7 — Estatísticas (`/estatisticas`)

- [x] `page.tsx` — tabs: ARTILHARIA / ASSISTÊNCIAS / CARTÕES
- [x] `RankingList` — ranking com barras visuais horizontais proporcionais, #1 com borda gold e destaque

---

## ✅ Checklist de validação

```bash
pnpm --filter web dev    # abrir http://localhost:3000
# Navegar: / → /elenco → /jogos → /blog → /galeria → /estatisticas
# Verificar dados do banco, logos, responsividade
```
