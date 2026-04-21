## Context

O site ja tem uma pagina de contato forte e um helper em `apps/web/src/lib/contact.ts`, mas o helper tem apenas um telefone oficial: `17 99673-5427`. Esse numero continua sendo o contato do site/administracao tecnica, enquanto assuntos do time precisam ir para `17 99658-2337` e `warface01031999@gmail.com`.

A pagina publica de campeonato usa dados locais do banco e calcula a classificacao em `packages/db/src/services/football.ts`. A fonte oficial da cidade, porem, vem do Placarsoft. A consulta feita em 2026-04-21 encontrou:

- Discovery: `GET https://core.b6.placarsoft.com/api/v1/placarsoft/client?host=pirangi.portal.placarsoft.com.br&portal=1`
- Backend descoberto: `https://pirangi.b05.mandalore.esp.br/api/v1`
- Competicao: `544099817090171200`
- Fase de grupos: `28`
- Grupo unico: `19`
- Tabela: `GET /portal/competitions/groups/19`
- Atualizacao oficial: `21/04/2026 17:50:13`
- Resenha FC: 7o, 3 jogos, 3 pontos, 1 vitoria, 2 derrotas, 13 gols pro, 10 gols contra

O ponto critico e que a ordem oficial da tabela nao bate com o desempate generico local. Portanto, para essa competicao, a posicao oficial deve vir da API/snapshot do Placarsoft, nao de uma ordenacao local por saldo ou gols pro.

## Goals / Non-Goals

**Goals:**

- Separar contatos por finalidade: time, site/tecnico e e-mail.
- Evitar links `wa.me`, `mailto:` e textos com numero antigo em caminhos do time.
- Fazer formularios e CTAs escolherem automaticamente o destino certo pelo assunto.
- Exibir classificacao e jogos da competicao indicada de acordo com o Placarsoft.
- Preservar fallback local quando a fonte externa falhar, com indicacao visual de que os dados podem estar desatualizados.
- Cobrir a ordenacao oficial com testes para evitar regressao.

**Non-Goals:**

- Criar automacao de atendimento, CRM ou inbox.
- Criar painel administrativo completo para configurar qualquer fonte externa.
- Trocar todo o modelo de campeonatos do banco.
- Implementar crawler visual da pagina do Placarsoft; a integracao deve usar a API JSON descoberta.
- Inferir regras secretas de desempate do Placarsoft quando a propria resposta ja traz `index` e tabela ordenada.

## Decisions

### Decision 1: Registry central de contatos por finalidade

`apps/web/src/lib/contact.ts` deve deixar de exportar apenas um contato global e passar a exportar um registry com canais por finalidade, por exemplo:

- `team`: display `17 99658-2337`, WhatsApp `5517996582337`, e-mail `warface01031999@gmail.com`.
- `site`: display `17 99673-5427`, WhatsApp `5517996735427`, e-mail `warface01031999@gmail.com`.

Os builders de WhatsApp/e-mail devem receber um destino ou uma intencao. As exports antigas podem continuar como alias temporario para reduzir quebra, mas devem apontar para o destino correto para assuntos gerais do time.

**Rationale:** a regra de negocio e simples, mas espalhar numeros pelo JSX aumenta risco de divergencia. Um registry deixa a mudanca testavel.

**Alternatives considered:**

- Manter constantes soltas: rapido, mas facil de errar em paginas comerciais e formularios.
- Variaveis de ambiente: util para deploys diferentes, mas esses contatos sao publicos e fazem parte do conteudo do site.

### Decision 2: Roteamento por intencao no contato

As intencoes existentes em `CONTACT_INTENTS` devem carregar um destino. Assuntos do time, incluindo apoio, patrocinio do time, jogos, imprensa, institucional e duvidas gerais do clube, devem usar `team`. Parcerias comerciais para aparecer no site, problemas no site, manutencao, conteudo tecnico ou administracao do portal devem usar `site`.

O formulario deve montar a mensagem e abrir WhatsApp/e-mail no destino resolvido. A UI tambem deve exibir o destino usado para que a pessoa entenda para onde a conversa vai.

**Rationale:** o usuario nao deve escolher entre numeros sem saber a diferenca. O assunto ja carrega contexto suficiente.

**Alternatives considered:**

- Mostrar dois botoes sempre: aumenta ruido e gera mensagens no canal errado.
- Mandar tudo para o numero do site: contradiz a regra informada pelo usuario.

### Decision 3: Adapter Placarsoft dedicado e sem dependencia nova

Criar um adapter pequeno, preferencialmente em `apps/web/src/lib/placarsoft.ts` ou `apps/web/src/lib/officialCompetitions.ts`, usando `fetch` nativo do Next.js. O adapter deve:

- Descobrir backend via endpoint de discovery quando necessario.
- Permitir configuracao estatica da fonte oficial para o slug/ID da competicao atual.
- Buscar `/portal/competitions/{competitionId}/phases` para identificar fase atual quando nao houver IDs fixos.
- Buscar `/portal/competitions/groups/{groupId}` para tabela e rodadas.
- Normalizar resposta em tipos de apresentacao usados pela pagina.
- Aplicar timeout e tratamento de erro.

**Rationale:** o escopo atual e uma competicao especifica e uma API JSON disponivel. Um adapter local resolve sem introduzir SDK, scraping ou nova dependencia.

**Alternatives considered:**

- Salvar tudo no banco antes de exibir: robusto para historico, mas maior escopo e exige ferramenta de sincronizacao.
- Continuar apenas com `buildStandings`: nao respeita a ordem oficial do Placarsoft.
- Fazer scraping do HTML: fragil e desnecessario porque a API foi localizada.

### Decision 4: Fonte oficial vence calculo local na pagina de campeonato

Quando uma competicao tiver fonte Placarsoft configurada e a busca funcionar, `apps/web/src/app/campeonatos/[slug]/page.tsx` deve renderizar a classificacao e jogos normalizados do Placarsoft. A ordenacao deve respeitar `table[].index`, e as estatisticas devem usar `table[].data`.

O `buildStandings` local continua existindo para competicoes sem fonte oficial e como fallback.

**Rationale:** o bug relatado e justamente divergencia com a tabela oficial. O dado oficial ja vem ordenado.

**Alternatives considered:**

- Tentar replicar desempates no `buildStandings`: pode continuar divergindo se a competicao tiver regra manual ou head-to-head nao modelado.
- Corrigir apenas os dados locais manualmente: resolve uma vez, mas falha quando sair novo resultado.

### Decision 5: Fallback explicito e verificavel

Se a API externa falhar, a pagina pode mostrar dados locais, mas deve incluir estado discreto informando que houve falha ao atualizar pela fonte oficial e, quando houver, a ultima data oficial conhecida.

**Rationale:** e melhor manter a pagina util do que quebrar, mas dados locais nao podem parecer confirmados pela cidade se a fonte oficial nao respondeu.

**Alternatives considered:**

- Quebrar a pagina com erro: ruim para torcedores.
- Silenciar o erro: reproduz o problema de confianca.

### Decision 6: Testes em camada de normalizacao

Adicionar testes para o adapter/normalizador usando fixture reduzida da resposta oficial de `groups/19`. O teste deve garantir a ordem `RCF`, `VPA`, `RAS`, que o Resenha FC aparece em 7o, e que jogos finalizados/agendados mapeiam placar, status e rodada corretamente.

**Rationale:** o risco principal nao e CSS; e a semantica da classificacao. Testar o normalizador e mais estavel do que testar a pagina inteira.

**Alternatives considered:**

- Testar so snapshot visual: fraco para detectar regra de ordenacao.
- Testar chamada real em CI: instavel por rede externa.

## Risks / Trade-offs

- [Risk] O e-mail foi informado como `warface01031999@gmail`, sem dominio completo. -> Mitigation: usar `warface01031999@gmail.com`, que ja existe no codigo atual e e o formato valido para `mailto:`.
- [Risk] O Placarsoft pode mudar contratos de API. -> Mitigation: isolar em adapter pequeno e manter fallback local.
- [Risk] Fetch server-side pode deixar a pagina mais lenta. -> Mitigation: timeout curto, cache/revalidate quando apropriado e fallback local.
- [Risk] O site pode ter CTAs comerciais usando `wa.me/?text=` sem numero. -> Mitigation: revisar todos os builders e substituir por destino explicito.
- [Risk] Fonte oficial e banco local podem ter nomes de times diferentes. -> Mitigation: quando a fonte externa estiver ativa, usar nome, sigla, escudo e posicao da propria fonte oficial para a tabela.

## Migration Plan

1. Atualizar `contact.ts` com registry de canais e builders por finalidade.
2. Trocar CTAs/formularios para resolverem destino por intencao.
3. Criar adapter/normalizador Placarsoft com fixture e teste.
4. Configurar a competicao `544099817090171200`/grupo `19` como fonte oficial da pagina correspondente.
5. Atualizar a pagina de campeonato para preferir dados oficiais e exibir fallback quando necessario.
6. Rodar testes unitarios e build/lint do app afetado.

Rollback: reverter os arquivos de contato e o adapter/pagina de campeonato. Sem migracao obrigatoria na abordagem inicial, o rollback nao exige alteracao de banco.

## Open Questions

- Nenhuma pergunta bloqueadora. A implementacao deve assumir `warface01031999@gmail.com` como normalizacao valida do e-mail informado.
