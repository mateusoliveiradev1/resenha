# 04 — API Contracts (Server Actions)

> Todas as operações são **Server Actions** tipadas com Zod. **Sem API routes REST.**

## Result Type Padrão

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; field?: string }
```

---

## Players

| Action | Input | Return | Auth |
|--------|-------|--------|------|
| `getPlayers(filters?)` | `{ position?, active? }` | `Player[]` | Public |
| `getPlayer(id)` | `{ id: uuid }` | `Player & { stats: AggregatedStats }` | Public |
| `createPlayer(data)` | `CreatePlayerSchema` | `ActionResult<Player>` | Admin |
| `updatePlayer(id, data)` | `UpdatePlayerSchema` | `ActionResult<Player>` | Admin |
| `deletePlayer(id)` | `{ id: uuid }` | `ActionResult<void>` | Admin |

## Matches

| Action | Input | Return | Auth |
|--------|-------|--------|------|
| `getMatches(filters?)` | `{ type?, status?, limit? }` | `Match[]` | Public |
| `getMatch(id)` | `{ id: uuid }` | `Match & { stats: MatchStat[] }` | Public |
| `getNextMatch()` | — | `Match \| null` | Public |
| `createMatch(data)` | `CreateMatchSchema` (inclui upload opponent_logo) | `ActionResult<Match>` | Admin |
| `updateMatch(id, data)` | `UpdateMatchSchema` | `ActionResult<Match>` | Admin |
| `upsertMatchStats(data)` | `UpsertMatchStatsSchema` | `ActionResult<MatchStat[]>` | Admin |

## Posts (com automação)

| Action | Input | Return | Auth |
|--------|-------|--------|------|
| `getPosts(filters?)` | `{ published?, category?, limit? }` | `Post[]` | Public |
| `getPostBySlug(slug)` | `{ slug: string }` | `Post \| null` | Public |
| `createPost(data)` | `CreatePostSchema` → auto-gera slug, excerpt, reading_time | `ActionResult<Post>` | Admin |
| `updatePost(id, data)` | `UpdatePostSchema` → recalcula automáticos | `ActionResult<Post>` | Admin |
| `deletePost(id)` | `{ id: uuid }` | `ActionResult<void>` | Admin |

## Gallery

| Action | Input | Return | Auth |
|--------|-------|--------|------|
| `getPhotos(filters?)` | `{ matchId?, limit? }` | `Photo[]` | Public |
| `uploadPhoto(data)` | `UploadPhotoSchema` | `ActionResult<Photo>` | Admin |
| `deletePhoto(id)` | `{ id: uuid }` | `ActionResult<void>` | Admin |

## Stats (Agregadas)

| Action | Input | Return | Auth |
|--------|-------|--------|------|
| `getTopScorers(limit?)` | `{ season?, limit? }` | `PlayerStat[]` | Public |
| `getTopAssists(limit?)` | `{ season?, limit? }` | `PlayerStat[]` | Public |
| `getPlayerStats(id)` | `{ playerId: uuid }` | `AggregatedStats` | Public |

## Auth

| Action | Input | Return | Auth |
|--------|-------|--------|------|
| `signIn(credentials)` | `LoginSchema { email, password }` | `Session` | Public |
| `signOut()` | — | `void` | Authenticated |
