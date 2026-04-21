## Why

A pagina `/contato` hoje funciona como um formulario isolado e pouco acionavel, enquanto o site ja evoluiu bastante nas jornadas de monetizacao, apoio e parceria comercial. Melhorar essa rota agora cria uma central clara de contato para quem quer falar com o Resenha, reduz atrito para WhatsApp/e-mail e conecta melhor interessados em parceria, apoio, amistosos e assuntos institucionais.

## What Changes

- Transformar `/contato` em uma central de contato mais completa, com hero forte, canais diretos, motivos de contato e caminhos claros para cada tipo de pessoa.
- Exibir os contatos oficiais informados: WhatsApp/telefone `17 99673-5427` e e-mail `warface01031999@gmail.com`.
- Adicionar CTA principal para WhatsApp com mensagem pre-preenchida e CTA secundario para e-mail via `mailto:`.
- Reorganizar o formulario para deixar de ser um bloco solto e virar uma alternativa secundaria com campos uteis, validacao, estado de envio e orientacao por assunto.
- Direcionar interesses comerciais para a jornada de monetizacao existente, incluindo links para `/seja-parceiro`, `/apoiar-o-resenha` e `/patrocinadores` quando fizer sentido.
- Criar blocos de contato por necessidade: parceria comercial, apoio ao clube, amistosos/jogos, imprensa/conteudo, assuntos institucionais e duvidas gerais.
- Manter linguagem local, direta e profissional, sem prometer alcance, retorno financeiro ou resposta imediata.
- Adicionar metadata/SEO coerente para busca por contato, WhatsApp, parceria, patrocinio e Resenha RFC.
- Instrumentar cliques e envio de formulario com analytics seguros em no-op quando nao houver provedor configurado.

## Capabilities

### New Capabilities

- `contact-conversion-hub`: Cobre a pagina `/contato` como central de contato e conversao, incluindo canais diretos, formulario, direcionamento por interesse, CTAs, SEO, acessibilidade, analytics e integracao com as jornadas de monetizacao existentes.

### Modified Capabilities

- Nenhuma capacidade existente em `openspec/specs/` sera modificada, pois ainda nao ha specs arquivadas. A mudanca introduz uma nova capacidade para a pagina de contato.

## Impact

- `apps/web/src/app/(public)/contato/page.tsx`: principal rota afetada, com novo layout, conteudo, CTAs e formulario funcional/semifuncional conforme padroes existentes.
- `apps/web/src/components/monetization/LeadForm.tsx` e componentes proximos: possivel reaproveitamento ou criacao de variante/novo componente para contato geral.
- `apps/web/src/lib/analytics.ts`: possivel reuso para rastrear cliques em WhatsApp, e-mail, links internos e formulario de contato.
- `apps/web/src/app/api/leads/route.ts`: possivel reuso como destino inicial de formulario, sem criar nova infraestrutura se a API atual atender ao caso.
- `apps/web/src/components/layout/PublicHeader.tsx` e `packages/ui/src/layout/Footer.tsx`: podem receber pequenos ajustes se for necessario destacar melhor contato/WhatsApp.
- SEO e acessibilidade: metadata da rota, estrutura semantica, labels, foco em erros, links externos seguros e responsividade mobile/desktop.
