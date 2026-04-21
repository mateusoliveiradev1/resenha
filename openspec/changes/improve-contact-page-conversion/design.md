## Context

A rota publica `/contato` existe em `apps/web/src/app/(public)/contato/page.tsx`, mas hoje entrega uma experiencia rasa: titulo, texto curto e um formulario visual cujo botao nao executa envio real. Isso deixa escondidos os canais diretos do clube e cria atrito justamente depois das melhorias recentes de monetizacao, apoio e parceria comercial.

O projeto ja tem uma base boa para reaproveitar: `@resenha/ui` fornece `Container`, `Card`, `Button`, `Badge` e campos de formulario; as paginas `/seja-parceiro` e `/apoiar-o-resenha` ja usam WhatsApp/formulario como conversao; `apps/web/src/lib/analytics.ts` ja encapsula tracking com fallback seguro; e o footer/header ja expoem caminhos de apoio e parceria.

Os contatos oficiais desta mudanca sao:

- Telefone/WhatsApp exibido: `17 99673-5427`
- WhatsApp tecnico para link: `5517996735427`
- E-mail exibido e usado em `mailto:`: `warface01031999@gmail.com`

## Goals / Non-Goals

**Goals:**

- Fazer `/contato` virar uma central de contato e decisao, nao apenas um formulario.
- Exibir telefone/WhatsApp e e-mail como canais oficiais e acionaveis.
- Direcionar cada interesse para o melhor caminho: WhatsApp, e-mail, `/seja-parceiro`, `/apoiar-o-resenha` ou `/patrocinadores`.
- Dar ao formulario um comportamento util, com validacao e mensagem pre-preenchida para WhatsApp ou e-mail.
- Manter a experiencia visual alinhada ao Resenha: escura, esportiva, local, organizada e responsiva.
- Reaproveitar componentes e helpers existentes, sem adicionar dependencia nova.
- Rastrear cliques e envios de forma segura, sem quebrar a pagina quando analytics nao estiver configurado.

**Non-Goals:**

- Criar CRM, inbox administrativo ou automacao de atendimento nesta mudanca.
- Criar nova tabela de banco ou migracao obrigatoria para contato geral.
- Substituir as jornadas dedicadas de `/seja-parceiro` e `/apoiar-o-resenha`.
- Prometer tempo de resposta, alcance comercial, retorno financeiro ou resultado esportivo.
- Redesenhar header, footer ou design system alem de pequenos ajustes de descoberta, se necessarios.

## Decisions

### Decision 1: WhatsApp e e-mail como conversao primaria

A pagina deve priorizar dois canais diretos: WhatsApp e e-mail. O WhatsApp usa `https://wa.me/5517996735427?text=...` com mensagem pre-preenchida; o e-mail usa `mailto:warface01031999@gmail.com` com assunto e corpo coerentes.

**Rationale:** o contato mais provavel para parceria, apoio, amistoso e duvida geral acontece pelo celular. Criar backend novo antes de validar a pagina aumentaria custo sem melhorar a primeira conversa.

**Alternatives considered:**

- Manter apenas formulario: continua com alto atrito e sem canal direto visivel.
- Criar nova API/tabela de contato: melhora persistencia, mas aumenta escopo e nao e necessario para a primeira entrega.
- Enviar tudo para `/api/leads`: a API atual e orientada a `support` e `commercial`, enquanto `/contato` tambem cobre amistosos, imprensa e assuntos institucionais.

### Decision 2: Central por intencao antes do formulario

A pagina deve mostrar cards de interesse antes do formulario:

- `Parceria comercial`: link para `/seja-parceiro` e WhatsApp com mensagem comercial.
- `Apoiar o clube`: link para `/apoiar-o-resenha`.
- `Amistosos e jogos`: WhatsApp com mensagem sobre partida.
- `Imprensa e conteudo`: e-mail ou WhatsApp com assunto editorial.
- `Institucional`: e-mail.
- `Duvidas gerais`: formulario ou WhatsApp.

**Rationale:** o usuario nao deve interpretar sozinho qual canal usar. A central por intencao aproveita as jornadas criadas e evita que tudo caia em um formulario generico.

**Alternatives considered:**

- Um unico formulario com select de assunto: e simples, mas esconde os caminhos de maior conversao.
- So links para paginas existentes: ajuda monetizacao, mas abandona casos gerais como amistosos e institucional.

### Decision 3: Formulario de contato como fallback acionavel

O formulario deve ser um client component pequeno, especifico da pagina de contato, com campos:

- Nome obrigatorio.
- WhatsApp ou e-mail obrigatorio, exigindo pelo menos um canal de retorno valido.
- Assunto obrigatorio por lista.
- Mensagem obrigatoria.
- Consentimento de contato obrigatorio.

Ao enviar, ele deve validar os campos e gerar uma mensagem pre-preenchida. A acao recomendada e abrir WhatsApp; como fallback ou alternativa visual, permitir e-mail pre-preenchido.

**Rationale:** isso transforma o formulario em acao real sem depender de infraestrutura nova. A pessoa ainda pode revisar a mensagem antes de enviar no WhatsApp/e-mail.

**Alternatives considered:**

- Submit com `button type="button"` como hoje: parece funcional, mas nao entrega contato.
- Persistir como lead comercial/support sempre: forca dados gerais em uma tabela de monetizacao e perde semantica.

### Decision 4: Configuracao local de contatos

Os dados oficiais devem ficar centralizados em constante local ou helper simples, por exemplo `apps/web/src/lib/contact.ts`, exportando telefone exibido, numero normalizado, e-mail e builders de href.

**Rationale:** evita repetir o numero/e-mail em varios blocos e reduz risco de divergencia quando o contato mudar.

**Alternatives considered:**

- Hardcode direto no JSX: mais rapido, mas fragil.
- Variaveis de ambiente: util para deploys distintos, mas exagerado para dado publico e fixo.

### Decision 5: Analytics usando caminho existente

Cliques em WhatsApp, e-mail, links internos e envio do formulario devem usar `data-monetization-event="cta_click"` e/ou `trackMonetizationEvent("monetization_cta_click", ...)` com `source` como `contact_page` ou `contact_form`.

Nao adicionar novos nomes de evento na Fase 1, porque `monetization_events.event_name` e tipado por enum e isso exigiria migracao.

**Rationale:** o tracking atual ja persiste eventos e no-opa com seguranca quando provedor externo nao existe. Reaproveitar `monetization_cta_click` entrega visibilidade sem mexer no schema.

**Alternatives considered:**

- Criar `contact_form_submit`: mais semantico, mas exige alterar enum, migrations e possivelmente admin/relatorios.
- Nao trackear formulario: perde a principal metrica da melhoria.

### Decision 6: Visual de pagina util, nao landing page comercial

`/contato` deve ter hero forte, canais diretos, cards de assunto, bloco de formulario e microcopy de expectativa. A pagina deve seguir a paleta `navy`, textos `cream`, acentos azul/dourado, icons de `lucide-react`, `Container`, grids responsivos e CTAs arredondados ja usados no site.

**Rationale:** contato precisa parecer parte do portal oficial, nao uma pagina comercial separada ou um formulario administrativo.

**Alternatives considered:**

- Copiar visual de `/seja-parceiro`: pode deixar contato geral comercial demais.
- Manter o bloco simples atual: nao acompanha o nivel visual e funcional das paginas recentes.

## Risks / Trade-offs

- [Risk] Numero ou e-mail mudarem depois do deploy -> Mitigation: centralizar os contatos em um helper unico e usar esse helper em todos os blocos.
- [Risk] Formulario sem persistencia gerar expectativa errada -> Mitigation: copy deve explicar que a pessoa sera levada ao WhatsApp/e-mail para concluir o envio.
- [Risk] Muitos caminhos deixarem a pagina dispersa -> Mitigation: hero com duas acoes principais e cards de assunto com labels curtos.
- [Risk] Interesses comerciais voltarem para contato generico -> Mitigation: cards e copy devem apontar `/seja-parceiro` como trilha ideal.
- [Risk] Tracking novo quebrar por enum de banco -> Mitigation: usar `monetization_cta_click` existente com `source` e `label` descritivos.
- [Risk] Mobile ficar pesado -> Mitigation: grids em uma coluna, CTAs full-width quando necessario e cards compactos.

## Migration Plan

1. Criar helper de contato com telefone, e-mail e builders de WhatsApp/e-mail.
2. Substituir a pagina `/contato` por uma central de contato com hero, canais diretos, cards de interesse, formulario e metadata atualizada.
3. Implementar o formulario client-side com validacao, estados de erro/sucesso e abertura de WhatsApp/e-mail pre-preenchido.
4. Instrumentar CTAs e formulario usando analytics existente.
5. Verificar layout mobile/desktop, acessibilidade dos campos e links externos.

Rollback: como a mudanca fica concentrada em `/contato` e componentes/helper novos, o rollback consiste em reverter esses arquivos sem migracao de banco.

## Open Questions

- Nao ha perguntas bloqueadoras. A implementacao deve assumir o WhatsApp `+55 17 99673-5427` e o e-mail `warface01031999@gmail.com` como contatos oficiais ate nova orientacao.
