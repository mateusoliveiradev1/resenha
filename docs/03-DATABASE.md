# 03 — Database Schema

> Banco: **Neon Postgres** (serverless), criado via MCP. ORM: **Drizzle**.

## users (admin)

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | `gen_random_uuid()` |
| email | text UNIQUE | |
| password_hash | text | bcrypt |
| name | text | |
| role | enum | `ADMIN` \| `EDITOR` |
| created_at | timestamp | `now()` |

## players

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| name | text | Nome completo |
| nickname | text | Apelido (exibido no card) |
| position | enum | `GOL` \| `DEF` \| `MEI` \| `ATA` |
| shirt_number | int | Camisa |
| photo_url | text | Upload admin |
| bio | text | Descrição |
| height_cm | int | Altura em cm |
| weight_kg | int | Peso em kg |
| birth_date | date | Para calcular idade |
| preferred_foot | text | `DIREITO` \| `ESQUERDO` \| `AMBIDESTRO` |
| is_active | boolean | default `true` |
| created_at | timestamp | |
| updated_at | timestamp | |

## matches

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| date | timestamp | Data/hora do jogo |
| opponent | text | Nome do adversário |
| opponent_logo | text | **Upload pelo admin** |
| type | enum | `FUTSAL` \| `CAMPO` |
| location | text | Local |
| score_home | int | Gols Resenha (null se agendado) |
| score_away | int | Gols adversário |
| status | enum | `SCHEDULED` \| `LIVE` \| `FINISHED` |
| season | text | "2025", "2026-1" |
| summary | text | Resumo curto |
| created_at | timestamp | |

> ⚠️ O logo do Resenha é **FIXO** em `/public/logo.png`. Admin só faz upload da logo do adversário.

## match_stats

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| match_id | uuid FK → matches | |
| player_id | uuid FK → players | |
| goals | int | default 0 |
| assists | int | default 0 |
| yellow_cards | int | default 0 |
| red_cards | int | default 0 |
| minutes_played | int | |

## posts

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| title | text | Digitado pelo admin |
| slug | text UNIQUE | 🤖 **AUTO** — `slugify(title)` |
| content | text | Rich text digitado pelo admin |
| excerpt | text | 🤖 **AUTO** — primeiros 160 chars |
| cover_image | text | Upload admin |
| author | text | |
| reading_time_min | int | 🤖 **AUTO** — `ceil(words/200)` |
| category | enum | `NOTICIA` \| `RESULTADO` \| `CRONICA` \| `BASTIDORES` |
| match_id | uuid FK → matches | Nullable — vincula a partida |
| is_published | boolean | default `false` |
| published_at | timestamp | Setado quando publica |
| created_at | timestamp | |
| updated_at | timestamp | |

> 🤖 **Automação**: Admin digita `title` + `content` + `category`. Sistema gera: slug, excerpt, reading_time.

## gallery

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| url | text | URL da imagem |
| caption | text | Legenda |
| match_id | uuid FK → matches | Nullable |
| uploaded_at | timestamp | |

## Relações

```
MATCHES  1──∞  MATCH_STATS
PLAYERS  1──∞  MATCH_STATS
MATCHES  1──∞  GALLERY
MATCHES  1──∞  POSTS
```
