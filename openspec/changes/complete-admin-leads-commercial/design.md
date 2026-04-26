## Context

A change `add-monetization-pages` definiu a jornada publica de apoio/parceria e ja existem implementacoes importantes no repo: `/apoiar-o-resenha`, `/seja-parceiro`, `/api/leads`, `/api/analytics/monetization`, tabelas de monetizacao, validadores, sidebar admin com `Leads` e `Comercial`, `apps/admin/src/actions/leads.ts` e `apps/admin/src/actions/commercial.ts`.

O trabalho que falta nao e criar tudo do zero. A lacuna esta em acabamento operacional: o admin precisa ser confiavel para usar no dia a dia, os dados precisam bater entre site/API/admin/relatorios, e os modulos precisam ter feedback, filtros, detalhe e QA suficientes para nao ficarem como "telas que existem, mas ainda nao fecham o fluxo".

Estado observado:

- `apps/web/src/app/api/leads/route.ts` persiste leads em `monetizationLeads`.
- `apps/web/src/lib/analytics.ts` e `MonetizationAnalytics.tsx` persistem eventos monetizaveis em `monetizationEvents`.
- `packages/db/drizzle/0006_clumsy_northstar.sql` cria leads, eventos, oferta comercial, oferecimentos e `relationship_type` de patrocinadores.
- `packages/db/drizzle/0007_monetization_phase3.sql` cria automacoes, campanhas, paginas premium e experimentos.
- `apps/admin/src/app/(admin)/leads/page.tsx` mostra metricas, tabela e status, mas ainda precisa de filtros, detalhe e tratamento operacional melhor.
- `apps/admin/src/app/(admin)/comercial/page.tsx` concentra muitas secoes em um server component grande; funciona como base, mas precisa de UX de edicao, feedback, separacao e QA.
- As paginas publicas ja consomem parte do conteudo dinamico, mas a integridade entre payloads, nomes de eventos e relatorios deve ser revisada ponta a ponta.

## Goals / Non-Goals

**Goals:**

- Tornar `Leads` uma caixa de entrada operacional completa para contatos de apoio e comercial.
- Tornar `Comercial` uma central usavel para configurar oferta base, extras, oferecimentos, automacoes, campanhas, paginas premium, experimentos e relatorios.
- Manter as rotas publicas e APIs existentes como o funil principal de captura.
- Reaproveitar `@resenha/ui`, Drizzle, server actions, Next App Router e os schemas existentes.
- Garantir que mudancas do admin revalidem e aparecam nas superficies publicas corretas.
- Adicionar QA minimo para fluxos criticos e corrigir regressions de lint/build.

**Non-Goals:**

- Criar CRM externo, checkout, pagamento, envio real automatico de WhatsApp/e-mail ou integracao paga.
- Redesenhar o admin inteiro ou trocar o design system.
- Criar permissao granular por papel alem do que o admin ja possui.
- Prometer metricas comerciais que o site ainda nao consegue medir com confianca.
- Criar um inventario publicitario automatizado complexo.

## Decisions

### Decision 1: Completar em cima do modelo de dados existente

Usar as tabelas atuais (`monetizationLeads`, `monetizationEvents`, `commercialOfferContents`, `editorialOfferings`, `leadFollowUpAutomations`, `commercialCampaignPackages`, `premiumPartnerPages`, `copyCtaExperiments`, `sponsors`) como fonte de verdade.

**Rationale:** o schema ja cobre a maior parte da operacao. Criar novas tabelas agora aumentaria risco de migracao e duplicacao sem resolver a usabilidade.

**Alternatives considered:**

- Criar um modulo CRM separado: poderoso demais para o momento e sem integracao real definida.
- Guardar configuracoes em arrays locais: simples, mas quebraria a promessa de admin editavel.

### Decision 2: Leads como inbox com detalhe, nao apenas tabela

O modulo de leads deve manter a tabela, mas adicionar filtros persistidos por query string, busca textual, detalhe/drawer ou pagina de detalhe, dados completos do lead, link de WhatsApp com template, mudanca de status e estados de erro/sucesso.

**Rationale:** uma tabela sem detalhe obriga o operador a inferir demais ou abrir o banco. O funil so fica 100% quando o responsavel consegue entender e acionar o lead dentro do painel.

**Alternatives considered:**

- Criar apenas cards de metricas: bom para leitura, insuficiente para operacao.
- Criar edicao completa de lead: pode vir depois; para fechar o fluxo, status, detalhe e contato resolvem mais.

### Decision 3: Comercial dividido em secoes editaveis com feedback

Manter a rota `/comercial`, mas organizar a tela em secoes/tabs ou blocos com componentes menores: dashboard, oferta/extras, oferecimentos editoriais, follow-up, campanhas, paginas premium, experimentos e relatorios. Formularios devem usar server actions com feedback previsivel e validacoes visiveis.

**Rationale:** o arquivo atual concentra muita responsabilidade. Separar componentes reduz risco de regressao e torna a pagina navegavel sem introduzir dependencia nova.

**Alternatives considered:**

- Criar varias rotas (`/comercial/ofertas`, `/comercial/campanhas`): melhora escala, mas aumenta navegacao agora. Pode ser refinamento futuro se a pagina ficar pesada.
- Manter tudo em um unico server component: rapido, mas dificil de manter e testar.

### Decision 4: Revalidacao explicita das superficies publicas

Cada save/delete comercial deve revalidar as rotas publicas afetadas: `/seja-parceiro`, `/patrocinadores`, `/parceiros/[slug]` quando aplicavel, posts/blog quando oferecimentos mudarem, e `/comercial`/`/leads` no admin.

**Rationale:** a pessoa que edita no admin precisa confiar que o site publico reflete a configuracao. Revalidar demais e aceitavel neste escopo; nao revalidar quebra a operacao.

**Alternatives considered:**

- Usar apenas `force-dynamic`: ja ajuda, mas nao substitui feedback e invalidacao explicita em fluxos de edicao.
- Revalidar tudo sempre: simples, mas mais custoso e menos claro.

### Decision 5: Analytics normalizado antes de relatorio

Os data attributes publicos devem mapear para eventos validos (`monetization_cta_click`, `partner_logo_click`, `plan_cta_click`, `faq_expand`, form events). A API deve persistir campos normalizados e manter `rawPayload` para auditoria.

**Rationale:** relatorio comercial depende de eventos consistentes. Pequenas divergencias de nome quebram contagem e deixam o dashboard enganoso.

**Alternatives considered:**

- Ler apenas `rawPayload`: flexivel, mas torna relatorio fragil.
- Enviar analytics para provedor externo apenas: fora do escopo e sem garantia para o admin.

### Decision 6: QA orientado por fluxo

Os checks devem cobrir o funil: formulario publico cria lead, lead aparece no admin, status muda, WhatsApp usa template, oferta comercial ativa altera a pagina publica, parceiro premium publica/despublica, eventos entram no relatorio.

**Rationale:** lint/build sozinho nao prova que a operacao comercial funciona. O risco aqui e de integracao, entao a verificacao precisa atravessar os modulos.

**Alternatives considered:**

- Testes unitarios isolados para tudo: bons, mas podem deixar passar problemas de App Router/server actions.
- QA manual sem script nenhum: rapido hoje, fragil para futuras mudancas.

## Risks / Trade-offs

- [Risk] O admin comercial ficar pesado por concentrar muitas secoes em uma rota -> Mitigation: extrair componentes internos e usar tabs/ancoras para reduzir carga cognitiva sem multiplicar rotas antes da hora.
- [Risk] Migrations locais nao baterem com banco remoto -> Mitigation: validar `packages/db/drizzle` contra schemas atuais e documentar qualquer migracao pendente antes de testar em ambiente real.
- [Risk] Server actions que lancam erro gerarem feedback ruim no formulario -> Mitigation: usar retorno estruturado ou `useActionState` nos formularios que precisam mostrar sucesso/erro inline.
- [Risk] Relatorios parecerem precisos com amostra baixa -> Mitigation: manter thresholds e mensagens de baixa confianca, como ja existe para parceiros com menos de 3 cliques.
- [Risk] Campos dinamicos ficarem diferentes entre API, validators e admin -> Mitigation: centralizar enums/validacoes em `@resenha/validators` e usar os mesmos nomes nos payloads.
- [Risk] WhatsApp abrir com numero invalido quando lead vier mal formatado -> Mitigation: normalizar telefone na captura e validar minimo com DDD antes de persistir.
- [Risk] Edicao comercial quebrar paginas publicas quando registros estao vazios -> Mitigation: manter fallbacks de copy e estados vazios em todas as superficies.

## Migration Plan

1. Confirmar que `0006_clumsy_northstar.sql` e `0007_monetization_phase3.sql` estao aplicadas no ambiente usado pelo admin.
2. Se alguma coluna/tabela do schema atual nao existir no banco real, gerar migration incremental em vez de editar migration antiga.
3. Implementar melhorias de UI/actions sem remover campos existentes.
4. Validar manualmente os fluxos de leads e comercial usando registros reais ou cadastrados pelo admin, sem seed de teste.
5. Rodar lint/build/test dos workspaces afetados.
6. Rollback: desativar registros comerciais dinamicos (`isActive=false`) e manter as paginas publicas nos fallbacks atuais; o modulo admin pode voltar a listar dados existentes sem perda.

## Open Questions

- O numero de WhatsApp operacional final deve continuar sendo o canal `site` atual em `CONTACT_CHANNELS` ou havera um responsavel comercial dedicado?
- O admin precisa de export CSV nesta etapa ou basta filtros, busca e detalhe acionavel?
- O status `WON` deve criar/atualizar automaticamente um patrocinador/parceiro no cadastro de patrocinadores, ou isso continua manual por enquanto?
