## Why

O painel admin ja possui modulos de leads e comercial, e a spec anterior de monetizacao abriu o caminho publico e parte da estrutura de dados, mas a operacao ainda nao esta confiavel o bastante para uso real. Esta mudanca fecha o ciclo 100%: capturar leads no site, acompanhar no admin, configurar ofertas comerciais, publicar dados consistentes e validar tudo com QA de fluxo completo.

## What Changes

- Finalizar o modulo `Leads` como caixa de entrada operacional para apoio e parceria comercial, com filtros, busca, detalhe acionavel, status, follow-up por WhatsApp, origem, dados completos e estados vazios/erro.
- Finalizar o modulo `Comercial` como central de configuracao para oferta base, extras, oferecimentos editoriais, campanhas, paginas premium, automacoes e experimentos, com criacao/edicao/remocao previsiveis.
- Integrar admin e site publico para que alteracoes comerciais realmente reflitam em `/seja-parceiro`, `/patrocinadores`, `/parceiros/[slug]`, posts/oferecimentos e relatorios.
- Revisar persistencia, migrations, validacoes e payloads de analytics/leads para eliminar divergencias entre schema, API, UI e relatorios.
- Melhorar a experiencia mobile/desktop do admin para que os modulos nao sejam apenas paginas tecnicas, mas ferramentas usaveis no dia a dia.
- Adicionar verificacoes e testes focados nos fluxos criticos: envio de lead, mudanca de status, CTA/analytics, criacao de oferta, campanha, pagina premium e publicacao.

## Capabilities

### New Capabilities

- `admin-lead-operations`: Cobre o recebimento, listagem, leitura, filtragem, status, contato e acompanhamento de leads de apoio e comercial no admin.
- `admin-commercial-operations`: Cobre a gestao admin de ofertas, extras, oferecimentos editoriais, automacoes, campanhas comerciais, paginas premium, experimentos e relatorios comerciais.
- `monetization-data-integrity`: Cobre consistencia de dados entre site publico, APIs, banco, analytics, migrations, validadores e superficies publicadas.

### Modified Capabilities

- Nenhuma capacidade arquivada em `openspec/specs/` sera modificada, pois o projeto ainda nao possui specs arquivadas. Esta mudanca cria contratos novos para completar a fase admin/comercial iniciada pelas specs abertas de monetizacao.

## Impact

- `apps/admin/src/app/(admin)/leads`: melhorias de tabela, cards mobile, filtros, detalhe, acoes e estados.
- `apps/admin/src/app/(admin)/comercial`: refinamento das secoes de configuracao, formularios, relatorios, feedback e publicacao.
- `apps/admin/src/actions/leads.ts` e `apps/admin/src/actions/commercial.ts`: validacao, erros, revalidacao, atualizacoes, remocoes e retornos operacionais.
- `apps/web/src/app/api/leads/route.ts` e `apps/web/src/app/api/analytics/monetization/route.ts`: alinhamento de validacao, payloads, persistencia e respostas.
- `apps/web/src/components/monetization`, `/seja-parceiro`, `/patrocinadores`, `/parceiros/[slug]` e posts: consumo correto de configuracoes comerciais e rastreamento.
- `packages/db/src/schema`, `packages/db/drizzle`, `packages/validators`: confirmar que migrations e schemas cobrem todos os campos usados pelo admin e site.
- `packages/ui/src/composites/DataTable.tsx` e componentes compartilhados, se necessario, para filtros/busca/acoes sem quebrar outros modulos.
- Testes e checks em `apps/web`, `apps/admin`, `packages/db` e `packages/validators`.
