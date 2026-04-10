# 10 - SDD Campeonatos + Elenco

> Neste arquivo, **SDD** significa **Solution Design Document** desta iniciativa especifica.
> O projeto continua usando **SDD = Schema-Driven Development** como principio geral em `01-VISAO-GERAL.md`.

## 1. Contexto

Hoje existem dois problemas centrais no produto:

1. A pagina detalhada de campeonato ja tem uma boa tabela na esquerda, mas o lado direito ainda entrega pouco valor. O usuario quer uma agenda navegavel, com cara de portal esportivo, agrupada por rodada e com navegacao por setas.
2. A pagina de elenco mostra `Jogos` apenas para quem ganhou linha em `match_stats`. Na pratica, jogadores que atuaram sem gol, assistencia, cartao ou minutos preenchidos aparecem com total errado.

Este documento define a solucao de produto, dados, UI e admin para corrigir os dois pontos sem quebrar a arquitetura atual do monorepo.

## 2. Diagnostico do estado atual

### 2.1 Campeonato

Arquivos impactados hoje:

- `apps/web/src/app/campeonatos/[slug]/page.tsx`
- `apps/web/src/components/jogos/MatchCard.tsx`
- `packages/db/src/services/football.ts`

Comportamento atual:

- A coluna esquerda ja renderiza a tabela com `StandingsPanel`.
- A coluna direita renderiza apenas o card `Leitura rapida` com proximo jogo, ultimo resultado e status.
- Os jogos da competicao aparecem somente abaixo, em uma grade plana de `MatchCard`, sem agrupamento e sem navegacao por rodada.
- O schema ja possui `matchday`, `roundLabel`, `phaseLabel`, `championshipGroupId` e `date`, entao o backend ja entrega dados suficientes para montar uma agenda melhor sem precisar de nova coluna para a UI.

Problema de UX:

- A pagina obriga o usuario a ler tabela em cima e agenda embaixo.
- Nao existe contexto de rodada.
- Quando uma rodada esta espalhada em dias diferentes, a lista plana perde a historia da competicao.
- O painel direito atual ocupa espaco nobre sem aprofundar o acompanhamento do campeonato.

### 2.2 Elenco

Arquivos impactados hoje:

- `apps/web/src/app/elenco/page.tsx`
- `apps/web/src/components/elenco/PlayerCard.tsx`
- `apps/admin/src/app/(admin)/partidas/[id]/EditarPartidaForm.tsx`
- `apps/admin/src/actions/matches.ts`
- `packages/db/src/schema/match-stats.ts`

Comportamento atual:

- A pagina de elenco calcula `matchesPlayed` com `count(match_stats.id)`.
- O admin salva estatisticas deletando e recriando todas as linhas de `match_stats` para a partida.
- A aba de estatisticas de partida hoje so adiciona linhas para jogadores que alguem decidiu registrar manualmente.

Problema de dominio:

- `match_stats` esta sendo usado ao mesmo tempo como "jogou a partida" e "teve evento estatistico".
- Sem uma entidade de participacao/aparicao, o sistema nao sabe quem entrou em quadra/campo e nao produziu evento.
- Resultado: `Jogos` mede "linhas salvas em match_stats" e nao "partidas disputadas".

## 3. Objetivos

Objetivos desta entrega:

- Manter a tabela/classificacao na esquerda da pagina de campeonato.
- Trocar o painel direito por uma agenda navegavel com setas, no estilo portal esportivo.
- Agrupar a agenda por **rodada** sempre que `matchday` existir.
- Usar agrupamento por **dia** apenas como fallback quando a competicao nao tiver rodada definida.
- Mostrar todos os jogos de uma rodada, mesmo quando forem disputados em dias diferentes.
- Corrigir o contador de `Jogos` no elenco para refletir participacao real.
- Ajustar o admin para registrar participacao de jogadores sem depender de gol/assistencia/cartao.

## 4. Fora de escopo

Nao faz parte desta iniciativa:

- Criar pagina publica individual para cada partida.
- Criar scout avancado por jogador alem de gols, assistencias, cartoes e participacao.
- Backfill perfeito de todo historico sem revisao manual.
- Cobertura ao vivo, minuto a minuto ou notificacoes push.

## 5. Decisoes de produto

### 5.1 Pagina de campeonato

Decisao:

- A pagina detalhada do campeonato continua em duas colunas no desktop.
- A esquerda fica a classificacao como esta hoje.
- A direita vira um **painel de agenda da competicao** com navegacao por setas.

Comportamento esperado:

- Cabecalho do painel mostra o grupo ativo: `1a Rodada`, `2a Rodada`, `Semifinal`, `11/04`, etc.
- Setas esquerda/direita navegam entre grupos disponiveis.
- O grupo ativo e escolhido automaticamente na carga inicial.
- Regra de escolha inicial:
  - Primeiro: grupo com jogo `LIVE`.
  - Segundo: proxima rodada/dia com jogo agendado.
  - Terceiro: ultima rodada/dia finalizada.
- Dentro do grupo, os jogos ficam ordenados por `date ASC`.
- Se a rodada tiver jogos em datas diferentes, todos continuam no mesmo grupo e cada item exibe sua propria data/hora.

### 5.2 Rodada primeiro, dia como fallback

Decisao:

- O agrupamento principal sera por `rodada` quando `matchday` estiver preenchido.
- O agrupamento por `dia` so entra quando a competicao nao tiver dado de rodada suficiente.

Justificativa:

- O usuario descreveu o campeonato como "4 jogos por rodada em dias diferentes".
- Se a UI agrupar por dia como regra principal, uma rodada ficaria quebrada em multiplos blocos e perderia o paralelo com Globo Esporte.
- O schema atual ja tem `matchday`, entao faz mais sentido fortalecer esse contrato do que ignorar o dado.

Regra de bucket:

- Se existir `matchday` no conjunto da competicao, o bucket usa:
  - `phaseLabel` para separar fases diferentes.
  - `championshipGroupId` para evitar mistura indevida quando necessario.
  - `matchday` como chave principal de rodada.
- Se `matchday` nao existir, o bucket usa a data local em `America/Sao_Paulo`.

### 5.3 Definicao de "Jogos" no elenco

Decisao:

- `Jogos` significa **partidas em que o jogador atuou**, nao partidas em que gerou evento estatistico.

Regra de negocio:

- Um jogador conta 1 jogo quando houver um registro explicito de participacao naquela partida.
- Gols, assistencias e cartoes continuam sendo eventos separados.
- Jogador com 0 gols e 0 assistencias pode e deve continuar com `Jogos > 0`.

## 6. Solucao de UX

### 6.1 Novo layout da pagina de campeonato

Wireframe funcional:

```txt
Desktop

+----------------------------------------------------+-----------------------------+
| TABELA / CLASSIFICACAO                             | JOGOS                       |
| StandingsPanel atual                               | < seta   3a RODADA   seta > |
|                                                    | 12/04 a 13/04              |
|                                                    |                             |
|                                                    | Quadra X  12/04 16:30      |
|                                                    | Time A x Time B             |
|                                                    |                             |
|                                                    | Campo Y   12/04 18:00      |
|                                                    | Time C x Time D             |
|                                                    |                             |
|                                                    | Ginasio Z 13/04 20:00      |
|                                                    | Time E x Time F             |
+----------------------------------------------------+-----------------------------+
```

Regras visuais:

- A tabela da esquerda nao muda de funcao.
- O painel direito usa a identidade atual do site: navy, bordas suaves, badges e tipografia display.
- O painel direito deve ser mais compacto que `MatchCard`, porque ele e um navegador de rodada, nao uma galeria de cards soltos.
- Em mobile, a ordem vira:
  - classificacao
  - agenda navegavel
- Em desktop, o painel direito pode ficar `sticky` para acompanhar a leitura da tabela, desde que nao quebre a navegacao.

### 6.2 Estrutura do item de jogo no painel direito

Cada item do grupo precisa mostrar:

- local
- data
- hora
- mandante x visitante
- escudos
- status ou placar
- desempate, quando existir

Nao mostrar no painel:

- resumo longo da partida
- CTA "fique por dentro" enquanto nao existir pagina publica de detalhe da partida

### 6.3 Componente recomendado

Criar um componente cliente dedicado, por exemplo:

- `apps/web/src/app/campeonatos/[slug]/CompetitionSchedulePanel.tsx`

Responsabilidades:

- receber buckets ja resolvidos pelo server
- manter indice atual do bucket
- renderizar setas
- sincronizar opcionalmente o bucket atual na URL com `searchParams`

## 7. Solucao tecnica para campeonato

### 7.1 Novos tipos de apresentacao

Criar um resolvedor de agenda, por exemplo:

- `apps/web/src/app/campeonatos/[slug]/competition-schedule.ts`

Tipo sugerido:

```ts
type ScheduleBucket = {
  id: string;
  kind: "MATCHDAY" | "DATE";
  title: string;
  subtitle: string | null;
  order: number;
  matches: ReturnType<typeof toDisplayMatch>[];
};
```

Resolucao do `title`:

- `roundLabel`, quando existir e for confiavel
- senao `${matchday}a Rodada`
- senao data formatada

Resolucao do `subtitle`:

- intervalo curto de datas quando a rodada ocupar mais de um dia
- nome da fase/grupo quando isso ajudar a desambiguar

### 7.2 Estrategia de selecao inicial

Ordem:

1. bucket com jogo `LIVE`
2. bucket com proximo jogo futuro
3. bucket da ultima rodada/dia finalizada

Isso evita que a pagina abra em uma rodada aleatoria e aproxima a experiencia do comportamento de portais esportivos.

### 7.3 Mudancas de arquivos

Arquivos previstos:

- `apps/web/src/app/campeonatos/[slug]/page.tsx`
- `apps/web/src/app/campeonatos/[slug]/CompetitionSchedulePanel.tsx`
- `apps/web/src/app/campeonatos/[slug]/competition-schedule.ts`
- `apps/web/src/components/jogos/MatchCard.tsx` apenas se alguma parte visual for reaproveitada

Mudanca principal na pagina:

- substituir o bloco `Leitura rapida` pelo novo painel de agenda
- remover a grade plana de jogos no fim da pagina ou rebaixar esse bloco para um papel secundario
- recomendacao: remover a grade plana do final para evitar duplicidade visual

## 8. Solucao tecnica para elenco

### 8.1 Decisao de modelagem

Decisao recomendada:

- Criar uma nova tabela `match_appearances`.

Schema sugerido:

```ts
match_appearances
- id
- match_id
- player_id
- started (boolean, opcional)
- minutes_played (integer, opcional)
- created_at
- updated_at

unique(match_id, player_id)
```

Justificativa:

- Separa participacao de evento.
- Permite que `Jogos` seja calculado com clareza.
- Facilita evolucoes futuras como titular/reserva/minutos.
- Evita depender de zero rows em `match_stats` como gambiarra semantica.

### 8.2 Papel de cada tabela

`match_appearances`:

- responde "quem jogou"

`match_stats`:

- responde "o que aconteceu com quem jogou"

### 8.3 Query publica do elenco

Nova regra de agregacao em `apps/web/src/app/elenco/page.tsx`:

- `matchesPlayed = count(distinct match_appearances.matchId)`
- `goals = legado do jogador + sum(match_stats.goals)`
- `assists = legado do jogador + sum(match_stats.assists)`

Observacao:

- `goals` e `assists` continuam aceitando o baseline legado atual dos jogadores.
- `Jogos` passa a ser exclusivamente derivado das aparicoes.

### 8.4 Mudancas no admin

Arquivo principal:

- `apps/admin/src/app/(admin)/partidas/[id]/EditarPartidaForm.tsx`

Mudanca recomendada:

- Trocar a aba unica de "Estatisticas de Jogadores" por duas etapas claras:
  - `Participacao`
  - `Eventos`

Fluxo:

1. Staff marca quais jogadores atuaram na partida.
2. Staff preenche gols, assistencias, cartoes e minutos para quem for necessario.
3. A tela de eventos ja carrega os jogadores selecionados na participacao.

Alternativa aceitavel, se quiser menos UI:

- Manter uma grade unica com checkbox `Jogou`.

Recomendacao final:

- Usar duas etapas ou duas sub-secoes na mesma aba, porque isso reduz erro operacional e deixa o dominio mais claro.

### 8.5 Persistencia no admin

Arquivo principal:

- `apps/admin/src/actions/matches.ts`

Novas actions ou extensoes:

- salvar `match_appearances`
- salvar `match_stats`
- manter revalidacao de:
  - `/elenco`
  - `/estatisticas`
  - `/jogos`
  - `/campeonatos/[slug]`

## 9. Migracao e backfill

### 9.1 Migracao estrutural

Passos:

1. Criar a tabela `match_appearances`.
2. Adicionar relacoes em `packages/db/src/schema`.
3. Opcional mas recomendado: criar indice unico composto em `match_stats(match_id, player_id)` para endurecer consistencia.

### 9.2 Backfill inicial

Backfill automatico seguro:

- Para cada linha existente em `match_stats`, criar uma `match_appearance` correspondente.

Limite conhecido:

- Partidas antigas em que alguem jogou e nao teve linha em `match_stats` continuarao incompletas ate revisao manual.

Mitigacao:

- Exibir no admin uma lista simples de partidas do Resenha sem aparicoes preenchidas.
- Revisar primeiro as duas partidas mais recentes, que sao exatamente as que o usuario ja percebeu no site.

## 10. Plano de implementacao

### Fase A - Campeonato

- Criar resolvedor de buckets por rodada/dia.
- Criar painel cliente com navegacao por setas.
- Substituir `Leitura rapida` pelo painel novo.
- Ajustar responsividade desktop/mobile.

### Fase B - Dados do elenco

- Criar schema `match_appearances`.
- Criar migration e backfill basico.
- Atualizar query publica do elenco para contar aparicoes.

### Fase C - Admin

- Adicionar UX de participacao de jogadores por partida.
- Salvar aparicoes e eventos em persistencias separadas.
- Revalidar rotas publicas afetadas.

### Fase D - Qualidade

- Cobrir agrupamento de agenda com testes unitarios.
- Cobrir agregacao de `Jogos` com testes unitarios.
- Validar fluxo do admin e visual do campeonato com Playwright.

## 11. Criterios de aceite

Campeonato:

- Em desktop, a tabela fica na esquerda e a agenda navegavel na direita.
- O usuario consegue trocar de rodada/dia usando setas.
- Quando `matchday` existir, a agenda agrupa por rodada.
- Jogos da mesma rodada em dias diferentes aparecem no mesmo bucket.
- Quando `matchday` nao existir, a agenda agrupa por dia.
- A pagina abre na rodada/dia mais relevante segundo a regra definida.

Elenco:

- Jogador que entrou em 2 partidas e nao fez gol continua exibindo `Jogos = 2`.
- Jogador que atuou em 2 partidas e marcou em 1 continua exibindo `Jogos = 2`.
- `Gols` e `Assist.` continuam corretos depois da migracao.

Admin:

- O staff consegue marcar participacao sem ser obrigado a inventar evento estatistico.
- O staff consegue editar eventos dos jogadores participantes.
- Salvar uma partida atualiza corretamente as paginas publicas.

## 12. Riscos e mitigacoes

Risco:

- `matchday` pode estar ausente ou mal preenchido em algumas partidas.

Mitigacao:

- Fallback automatico por dia.
- Checklist de preenchimento no admin para partidas de campeonato.

Risco:

- Historico antigo pode continuar com `Jogos` subcontado ate revisao.

Mitigacao:

- Backfill automatico do que ja existe.
- Revisao manual focada nas partidas mais recentes.

Risco:

- O painel direito pode ficar pesado se reutilizar `MatchCard` inteiro.

Mitigacao:

- Criar item compacto especifico para agenda de campeonato.

## 13. Recomendacao final

Para ficar do jeito que voce descreveu e sem remendo de curto prazo:

- `Campeonatos` deve virar uma pagina de **tabela + agenda por rodada navegavel**.
- `Elenco` precisa de uma entidade de **participacao** separada de estatistica.

Isso resolve a dor visual da competicao, corrige o numero de jogos do elenco e prepara o sistema para crescer sem ficar dependente de "quem marcou" para saber "quem jogou".
