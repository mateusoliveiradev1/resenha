## Why

O Resenha RFC ja tem uma presenca editorial e institucional consistente, mas a monetizacao ainda mistura apoio ao time, patrocinio do clube e oportunidade comercial do site em uma mesma percepcao. Esta mudanca cria uma estrutura nativa ao produto para mostrar, de forma simples, como comercios locais podem aparecer no site do Resenha sem competir com a experiencia editorial nem conflitar com patrocinadores offline do clube.

O momento e adequado porque o site ja possui conteudo, pagina de patrocinadores, formularios de contato e identidade visual consolidada; falta organizar as jornadas comerciais com clareza, copy propria, formularios especificos e pontos de descoberta bem dosados.

## What Changes

- Criar a pagina `Apoiar o Resenha`, com foco emocional, institucional e esportivo, voltada a pessoas, torcedores, apoiadores e empresas que querem fortalecer o clube.
- Criar a pagina `Seja parceiro` ou `Divulgue sua empresa no Resenha`, com foco comercial, voltada a negocios locais e regionais que querem aparecer nas materias, jogos e pagina de parceiros do Resenha RFC.
- Evoluir a pagina e a secao de patrocinadores para diferenciar patrocinadores/apoiadores institucionais do time e parceiros comerciais do site.
- Adicionar CTAs discretos e consistentes na home, header, footer, pagina de patrocinadores, posts e pontos editoriais selecionados, sem transformar o site em landing page comercial.
- Especificar componentes reutilizaveis para logos, cards de parceiro, blocos de oferecimento, badges, banners comerciais discretos, oferta simples de entrada, FAQ, WhatsApp como CTA principal, formularios secundarios e destaques premium.
- Definir copy, microcopy, FAQ, estados vazios, validacoes de formulario, analytics e criterios de sucesso para validar as duas jornadas.
- Preparar a implementacao para captura inicial via WhatsApp/formulario/e-mail, com caminho futuro para CRM, automacoes e gestao comercial no admin.

## Capabilities

### New Capabilities

- `club-support-journey`: Cobre a pagina e os fluxos de apoio institucional/esportivo ao Resenha RFC, incluindo posicionamento, formulario, copy, FAQ, CTAs e expectativas para apoiadores.
- `commercial-partnership-journey`: Cobre a pagina e os fluxos de anuncio no site para comercios locais, incluindo proposta de valor direta, exemplos visuais de onde a empresa aparece, oferta simples de entrada, WhatsApp como CTA principal, formulario secundario, prova concreta e conversao.
- `monetization-discovery-and-sponsor-showcase`: Cobre descoberta das jornadas no site existente, evolucao da vitrine de patrocinadores/parceiros, componentes reutilizaveis, SEO leve e analytics de monetizacao.

### Modified Capabilities

- Nenhuma capacidade existente em `openspec/specs/` sera modificada, pois ainda nao ha specs arquivadas. A mudanca introduz novas capacidades e orienta a evolucao das telas ja existentes.

## Impact

- `apps/web/src/app/(public)`: novas rotas publicas para apoio e parceria comercial; possivel ajuste em `patrocinadores` e `contato`.
- `apps/web/src/components/home`: inclusao controlada de CTAs e/ou banner discreto na home, preservando prioridade editorial.
- `apps/web/src/components/layout/PublicHeader.tsx` e `packages/ui/src/layout/Footer.tsx`: ajustes de navegacao e descoberta para as duas jornadas.
- `apps/web/src/components/sponsors`: evolucao de tiles, cards, badges e componentes de vitrine de parceiros.
- `packages/ui`: possivel reaproveitamento/pequena extensao de Button, Card, Badge, FormField, Input e componentes de layout, sem redesign do design system.
- `packages/db` e `packages/validators`: inicialmente opcionais; a Fase 1 pode operar com formularios sem persistencia propria. Fases futuras podem adicionar tabelas de leads, tipos de parceiro e metadados comerciais.
- SEO e analytics: novas metadata pages, eventos de clique/envio/scroll e estrutura semantica para descoberta organica futura.
