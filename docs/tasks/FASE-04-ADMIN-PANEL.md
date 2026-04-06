# Fase 4 — Admin Panel (`apps/admin`)

> **Referências**: `05-AUTH-SEGURANCA.md` (auth flow), `04-API-CONTRACTS.md` (mutations), `07-WIREFRAMES.md` (admin layout)
> **Resultado esperado**: Painel admin funcional com login, dashboard e CRUD completo.

---

## 4.1 — Autenticação

- [x] `/login/page.tsx` — form email + senha, validação Zod (`LoginSchema`), error states, submit via Server Action
- [x] `middleware.ts` — proteger TODAS as rotas exceto `/login` usando Auth.js edge config
- [x] `layout.tsx` — auth guard server-side (redireciona se não autenticado), Sidebar + Container

---

## 4.2 — Dashboard (`/`)

- [x] Cards overview: total jogadores ativos, total jogos, total posts publicados, próximo jogo agendado
- [x] Card com último resultado (placar + adversário)
- [x] Lista de atividade recente (últimas 5 ações: post criado, jogador adicionado, etc.)

---

## 4.3 — CRUD Jogadores (`/jogadores`)

- [x] **Listar** — DataTable: foto mini, nome, posição, número, status ativo, ações (editar/excluir)
- [x] **Criar** (`/jogadores/novo`) — Form com: nome, apelido, posição (select), número, bio, altura, peso, data nasc., pé preferido, upload foto
- [x] **Editar** (`/jogadores/[id]`) — Mesmo form preenchido + toggle ativo/inativo
- [x] **Server Actions**: `createPlayer`, `updatePlayer`, `deletePlayer` — Zod validation, `revalidatePath`

---

## 4.4 — CRUD Partidas (`/partidas`)

- [x] **Listar** — DataTable: data, adversário, tipo, placar, status, ações
- [x] **Criar** (`/partidas/novo`) — Form: data/hora, adversário, tipo (FUTSAL/CAMPO), local, **upload logo adversário** (Resenha é fixo!)
- [x] **Editar** (`/partidas/[id]`) — Atualizar placar, status, logo adversário + **lançar stats por jogador**:
  - Lista de jogadores → para cada: gols, assists, cartões, minutos
  - Usar `UpsertMatchStatsSchema` para salvar
- [x] **Server Actions**: `createMatch`, `updateMatch`, `upsertMatchStats`

---

## 4.5 — CRUD Posts (`/posts`) — com automação

- [x] **Listar** — DataTable: título, categoria, status (publicado/rascunho), data, ações. Filtro por categoria
- [x] **Criar** (`/posts/novo`):
  - Editor rich text para conteúdo
  - Campo título (obrigatório)
  - Seletor de categoria (NOTÍCIA/RESULTADO/CRÔNICA/BASTIDORES)
  - Upload cover image
  - Seletor "Vincular a partida" (dropdown de partidas)
  - 🤖 **Automação** (no Server Action, NÃO no form):
    - `slug` = `slugify(title)`
    - `excerpt` = `content.slice(0, 160) + "..."`
    - `reading_time_min` = `Math.ceil(wordCount / 200)`
  - Toggle publicar agora / salvar rascunho
- [x] **Editar** (`/posts/[id]`) — Mesmo form, recalcula automáticos ao salvar
- [x] **Server Actions**: `createPost`, `updatePost`, `deletePost`

---

## 4.6 — Galeria Admin (`/galeria`)

- [x] Grid de fotos existentes com caption e botão excluir
- [x] Upload múltiplo de fotos (drag & drop ou file input)
- [x] Seletor "Vincular a partida" (dropdown opcional)
- [x] **Server Actions**: `uploadPhoto`, `deletePhoto`

---

## ✅ Checklist de validação

```bash
pnpm --filter admin dev  # abrir http://localhost:3001
# Login: admin@resenha.com / admin123
# CRUD: criar jogador → verificar em /elenco do site público
# CRUD: criar partida + stats → verificar em /jogos e /estatisticas
# CRUD: criar post → verificar em /blog
```
