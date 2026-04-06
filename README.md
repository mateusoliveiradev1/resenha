<div align="center">
  <img src="apps/web/public/logo2.png" alt="Resenha RFC" width="112" />
  <h1>Resenha RFC</h1>
  <p><strong>Plataforma institucional e painel administrativo do clube.</strong></p>
  <p>
    Projeto full-stack em monorepo para concentrar presenca digital, conteudo editorial,
    elenco, jogos, patrocinadores, galeria e operacao interna do Resenha RFC em uma unica base.
  </p>
  <p>
    <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-0B1220?style=for-the-badge&logo=nextdotjs&logoColor=white" />
    <img alt="React 19" src="https://img.shields.io/badge/React-19-0B1220?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-0B1220?style=for-the-badge&logo=typescript&logoColor=3178C6" />
    <img alt="Neon Postgres" src="https://img.shields.io/badge/Neon-Postgres-0B1220?style=for-the-badge&logo=postgresql&logoColor=8ED1FC" />
    <img alt="Auth.js" src="https://img.shields.io/badge/Auth.js-v5_beta-0B1220?style=for-the-badge&logo=auth0&logoColor=white" />
    <img alt="Vercel Ready" src="https://img.shields.io/badge/Vercel-ready-0B1220?style=for-the-badge&logo=vercel&logoColor=white" />
  </p>
</div>

---

## Sumario

- [Visao geral](#visao-geral)
- [Status do projeto](#status-do-projeto)
- [Experiencia entregue](#experiencia-entregue)
- [Arquitetura do monorepo](#arquitetura-do-monorepo)
- [Stack principal](#stack-principal)
- [Primeiros passos](#primeiros-passos)
- [Variaveis de ambiente](#variaveis-de-ambiente)
- [Comandos uteis](#comandos-uteis)
- [Banco e dominio](#banco-e-dominio)
- [Deploy](#deploy)
- [Documentacao complementar](#documentacao-complementar)
- [Licenca](#licenca)

## Visao geral

O **Resenha RFC** foi estruturado como um produto digital completo para um clube amador:

- **`apps/web`** concentra a experiencia publica do clube.
- **`apps/admin`** centraliza a operacao editorial e esportiva.
- **`packages/*`** compartilham autenticacao, banco, UI e validacoes entre as duas apps.

O objetivo da arquitetura e simples: manter a identidade visual, a consistencia de dados e a velocidade de evolucao do projeto sem fragmentar a base de codigo.

## Status do projeto

| Frente | Status | Observacao |
| --- | --- | --- |
| Site publico | Pronto para evolucao | Home, institucional, elenco, jogos, estatisticas, blog, galeria e patrocinadores |
| Painel admin | Pronto para operacao inicial | Login protegido, modulos de gestao e rotas autenticadas |
| Banco de dados | Estruturado | Drizzle + Neon com schema compartilhado no workspace |
| Design system | Compartilhado | Componentes reutilizaveis em `@resenha/ui` |
| Deploy Vercel | Preparado | Monorepo pronto para dois projetos separados |
| Upload de imagens | Em transicao de producao | Ambiente atual usa disco local; a proxima etapa prevista e Vercel Blob |

## Experiencia entregue

### Site publico

- Landing page institucional com identidade do clube
- Paginas de historia, diretoria, titulos, patrocinadores e contato
- Elenco com dados esportivos e apresentacao visual
- Calendario e resultados de partidas
- Painel de estatisticas com rankings e recorte de campanha
- Blog com categorias editoriais e cronicas de jogo
- Galeria de imagens
- Links e CTA para area administrativa

### Painel administrativo

- Login protegido com **Auth.js**
- Protecao de rotas via **`proxy.ts`**
- Gestao de jogadores
- Gestao de partidas
- Gestao de posts
- Gestao de patrocinadores
- Gestao de galeria
- Estrutura para configuracoes operacionais

## Arquitetura do monorepo

```text
.
|-- apps
|   |-- web                 # Site publico
|   `-- admin               # Painel administrativo
|-- packages
|   |-- auth                # Configuracao compartilhada de autenticacao
|   |-- db                  # Cliente, schema e seeds do banco
|   |-- ui                  # Design system e layout compartilhado
|   `-- validators          # Schemas Zod reutilizaveis
|-- docs                    # Documentacao tecnica do projeto
|-- storage
|   `-- uploads             # Uploads locais usados no fluxo atual
|-- .env.example            # Variaveis base do projeto
|-- package.json            # Scripts raiz do monorepo
|-- pnpm-workspace.yaml     # Workspaces pnpm
`-- turbo.json              # Pipeline Turborepo
```

### Como as camadas se conectam

1. O usuario navega pela app publica ou pela app administrativa.
2. As duas apps consomem a mesma camada de dados em `@resenha/db`.
3. Validacoes de formularios e entradas passam por `@resenha/validators`.
4. Componentes visuais e layout base vivem em `@resenha/ui`.
5. A autenticacao do admin e centralizada em `@resenha/auth`.

### Organizacao das apps

| App | Porta local | Papel |
| --- | --- | --- |
| `apps/web` | `3000` | Presenca institucional, conteudo, elenco, jogos e descoberta do clube |
| `apps/admin` | `3001` | Operacao interna, login e atualizacao de conteudo/dados |

### Organizacao dos packages

| Package | Responsabilidade |
| --- | --- |
| `@resenha/auth` | Configuracao Auth.js, callbacks de sessao e autorizacao |
| `@resenha/db` | Cliente Drizzle, schema Postgres, seeds e acesso ao banco |
| `@resenha/ui` | Componentes, layout, utilitarios visuais e identidade compartilhada |
| `@resenha/validators` | Schemas Zod para auth, jogadores, partidas, posts, stats e patrocinadores |

## Stack principal

| Camada | Tecnologia |
| --- | --- |
| Monorepo | Turborepo + pnpm workspaces |
| Framework | Next.js 16 com App Router |
| Frontend | React 19 + TypeScript |
| Estilo | Tailwind CSS v4 + componentes compartilhados |
| Animacoes | Framer Motion |
| Banco | Neon Postgres |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 beta |
| Validacao | Zod |
| Deploy alvo | Vercel |

## Primeiros passos

### 1. Clonar o repositorio

```bash
git clone https://github.com/mateusoliveiradev1/resenha.git
cd resenha
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Criar o arquivo de ambiente

macOS/Linux:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

### 4. Preencher as variaveis minimas

Edite o `.env` com pelo menos:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_ADMIN_URL`

### 5. Subir as duas apps em paralelo

```bash
pnpm dev
```

Endpoints locais esperados:

- `http://localhost:3000` -> site publico
- `http://localhost:3001` -> painel admin

### 6. Subir apenas uma app quando necessario

```bash
pnpm --filter web dev
pnpm --filter admin dev
```

## Variaveis de ambiente

O projeto aceita variaveis na raiz e tambem dentro das apps. A camada de runtime em `packages/db/src/runtimeEnv.ts` procura arquivos `.env*` no workspace e prioriza a app em uso.

### Obrigatorias

| Variavel | Uso | Exemplo |
| --- | --- | --- |
| `DATABASE_URL` | Conexao principal do banco | `postgres://USER:PASSWORD@HOST:5432/DBNAME` |
| `AUTH_SECRET` | Segredo de autenticacao do admin | `replace-with-a-long-random-secret` |
| `NEXT_PUBLIC_ADMIN_URL` | URL publica do admin usada pelo site | `http://localhost:3001` |

### Alias suportados

| Variavel | Quando usar |
| --- | --- |
| `NEXTAUTH_SECRET` | Alias aceito pela stack atual de auth |
| `AUTH_URL` | URL base do admin para Auth.js |
| `NEXTAUTH_URL` | Alias de URL aceito pela stack atual |
| `ADMIN_APP_URL` | Alias server-side da URL do admin |

### Observacao importante sobre imagens

O fluxo atual de upload grava arquivos em `storage/uploads`. Isso atende desenvolvimento local e ambiente controlado, mas para producao em Vercel a recomendacao do projeto e migrar para **Vercel Blob** ou outro armazenamento persistente antes do rollout final.

## Comandos uteis

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Sobe todas as apps com Turborepo |
| `pnpm build` | Gera build das apps e packages que participam do pipeline |
| `pnpm lint` | Executa lint no monorepo |
| `pnpm test` | Executa o pipeline de testes configurado no workspace |
| `pnpm --filter web dev` | Sobe apenas o site publico |
| `pnpm --filter admin dev` | Sobe apenas o painel admin |
| `pnpm --filter web build` | Build isolado da app publica |
| `pnpm --filter admin build` | Build isolado da app administrativa |

## Banco e dominio

O dominio do projeto foi organizado para refletir a operacao real do clube.

### Entidades principais

| Tabela | Papel no sistema |
| --- | --- |
| `users` | Usuarios do admin com roles `ADMIN` e `EDITOR` |
| `players` | Elenco com numero, posicao, bio e estatisticas base |
| `matches` | Calendario, adversario, placar, status e temporada |
| `match_stats` | Gols, assistencias, cartoes e minutos por atleta em cada jogo |
| `posts` | Conteudo editorial, categorias e publicacao |
| `gallery` | Imagens da galeria vinculaveis a partidas |
| `staff` | Diretoria e equipe tecnica |
| `sponsors` | Patrocinadores, tiers e destaque na home |

### Seeds e bootstrap de dados

O package `packages/db` ja possui scripts TypeScript para popular parte do ambiente:

- `packages/db/seed.ts`
- `packages/db/seedPlayers.ts`
- `packages/db/seed-players.ts`

Esses arquivos sao uteis para acelerar ambientes de desenvolvimento e homologacao, principalmente na camada administrativa e no elenco inicial.

## Deploy

### Estrategia recomendada

O projeto foi pensado para subir no Vercel como **dois projetos separados** dentro do mesmo monorepo:

| Projeto | Root Directory | Funcao |
| --- | --- | --- |
| Web | `apps/web` | Site publico do clube |
| Admin | `apps/admin` | Painel administrativo |

### Base compartilhada

- Banco: **Neon Postgres**
- Repositorio: este monorepo
- Design system: `@resenha/ui`
- Validacoes: `@resenha/validators`
- Auth compartilhada: `@resenha/auth`

### Variaveis por deploy

#### Web

```env
DATABASE_URL=...
NEXT_PUBLIC_ADMIN_URL=https://admin.seu-dominio.com
```

#### Admin

```env
DATABASE_URL=...
AUTH_SECRET=...
AUTH_URL=https://admin.seu-dominio.com
```

### Observacoes de rollout

- O monorepo ja esta pronto para a configuracao inicial no Vercel.
- O banco ja segue uma estrutura adequada para deploy compartilhado.
- A proxima melhoria operacional prevista para producao e a troca do upload local por Vercel Blob.

## Documentacao complementar

O projeto ja possui uma base de documentacao interna em `docs/`:

| Documento | Tema |
| --- | --- |
| [`docs/00-INDICE.md`](docs/00-INDICE.md) | Mapa geral da documentacao |
| [`docs/01-VISAO-GERAL.md`](docs/01-VISAO-GERAL.md) | Escopo, principios e stack |
| [`docs/02-ARQUITETURA.md`](docs/02-ARQUITETURA.md) | Estrutura e regras da base |
| [`docs/03-DATABASE.md`](docs/03-DATABASE.md) | Modelo de dados |
| [`docs/04-API-CONTRACTS.md`](docs/04-API-CONTRACTS.md) | Contratos das acoes e fluxos |
| [`docs/05-AUTH-SEGURANCA.md`](docs/05-AUTH-SEGURANCA.md) | Auth, RBAC e seguranca |
| [`docs/06-DESIGN-SYSTEM.md`](docs/06-DESIGN-SYSTEM.md) | Identidade visual e UI |
| [`docs/07-WIREFRAMES.md`](docs/07-WIREFRAMES.md) | Mapa de telas |
| [`docs/08-PERFORMANCE.md`](docs/08-PERFORMANCE.md) | Diretrizes de performance |
| [`docs/09-DEPLOY.md`](docs/09-DEPLOY.md) | Topologia de deploy |

## Licenca

Este repositorio esta distribuido sob uma **licenca proprietaria**. Consulte o arquivo [`LICENSE`](LICENSE) para os termos atuais.

---

<div align="center">
  <strong>Resenha RFC</strong><br />
  Monorepo focado em identidade, operacao e crescimento digital do clube.
</div>
