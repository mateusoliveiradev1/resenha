## Context

O Resenha RFC e um produto digital esportivo/editorial local, nao uma landing page comercial isolada. A experiencia publica ja tem home institucional, conteudo editorial, elenco, jogos, estatisticas, galeria, pagina de patrocinadores, contato, header fixo e footer com bloco de parceria. A linguagem visual atual usa fundo `navy`, textos `cream`, acentos em azul e dourado, cards escuros com bordas sutis, banners em gradiente, badges pequenos, CTAs arredondados, grid editorial e componentes compartilhados de `@resenha/ui`.

O problema principal e de arquitetura de produto: hoje "apoiar o time", "patrocinar o clube", "ser parceiro" e "anunciar no site" podem ser percebidos como uma coisa so. Para monetizar sem conflito com patrocinadores offline do clube, a nova solucao deve separar duas jornadas:

- Apoiar o Resenha: jornada emocional, institucional e esportiva para fortalecer o clube.
- Seja parceiro / Divulgue sua empresa no Resenha: jornada comercial para negocios locais que querem aparecer nas materias, jogos e pagina de parceiros do Resenha.

Essa separacao precisa aparecer em pagina, navegacao, copy, formularios, componentes, analytics e expectativa de retorno. A monetizacao deve ser apresentada como uma extensao natural da cobertura profissional de um time amador, mantendo a prioridade do conteudo esportivo.

### Estado atual observado

- `apps/web/src/app/page.tsx`: home com `HeroSection`, proximo jogo, patrocinadores em destaque, ultimos resultados e posts recentes.
- `apps/web/src/components/home/HeroSection.tsx`: hero forte com escudo, grid, badges, CTAs `Ver elenco`, `Agenda do clube` e `Seja parceiro` apontando para `/patrocinadores`.
- `apps/web/src/components/layout/PublicHeader.tsx`: navegacao principal ja inclui `Patrocinadores`, topbar com "Ver parceiros oficiais" e CTA `Parcerias`.
- `apps/web/src/app/(public)/patrocinadores/page.tsx`: pagina de patrocinadores agrupada por cotas `MASTER`, `OURO`, `PRATA`, `APOIO`, com CTA para `/contato`.
- `apps/web/src/components/home/SponsorsMarquee.tsx`: vitrine de parceiros na home com CTA `Ver parceiros` e `Seja parceiro`.
- `packages/ui`: Button, Card, Badge, Input, FormField e Container prontos para reaproveitamento.
- `apps/web/src/lib/seo.ts`: helper para metadata, canonical, Open Graph e Twitter.

## Goals / Non-Goals

**Goals:**

- Criar uma especificacao pronta para implementacao de paginas, fluxos e secoes de monetizacao nativas ao Resenha RFC.
- Separar claramente apoio institucional/esportivo de parceria comercial/midia.
- Proteger a experiencia editorial: monetizacao visivel, mas sem poluir home, posts ou areas de conteudo.
- Reaproveitar o design system atual, a pagina de patrocinadores e os componentes visuais existentes.
- Preparar o site para vender anuncios simples e faceis de entender para comercios locais e parceiros regionais.
- Definir formularios, copy, componentes, analytics, SEO, responsividade, criterios de sucesso e roadmap por fases.
- Manter a primeira entrega simples, validavel e operavel por WhatsApp/e-mail antes de investir em CRM/admin mais complexo.

**Non-Goals:**

- Redesenhar a identidade visual do site.
- Criar uma landing page SaaS generica, com visual ou copy corporativa fria.
- Implementar precos fixos ou prometer metricas que o site ainda nao validou.
- Substituir patrocinadores offline do clube por anunciantes digitais.
- Criar checkout, pagamento online, area logada de parceiro ou inventario publicitario automatizado na Fase 1.
- Transformar cada materia em espaco comercial. O editorial continua sendo o produto principal.

## Decisions

### Decision 1: Duas rotas publicas separadas

Criar duas paginas publicas independentes:

- `/apoiar-o-resenha`: apoio institucional/esportivo.
- `/seja-parceiro`: parceria comercial/anuncio no site.

**Rationale:** duas rotas reduzem ambiguidade, permitem SEO especifico, formularios distintos e CTAs com intencao clara. Tambem evita que um comerciante local precise interpretar se "apoiar" significa doacao, patrocinio de uniforme, anuncio no site ou parceria de conteudo.

**Alternatives considered:**

- Usar apenas `/patrocinadores`: manteria tudo concentrado, mas perpetuaria a confusao entre apoio ao clube e publicidade digital.
- Usar apenas `/contato`: simples demais, sem proposta de valor suficiente para converter.
- Criar landing page unica de monetizacao: facil de construir, mas ficaria com cara de modulo separado e poderia quebrar a linguagem editorial.

### Decision 2: Naming recomendado

Nome recomendado para a jornada comercial: `Seja parceiro`.

Rotulo direto para headlines e CTAs: `Divulgue sua empresa no Resenha`.

**Rationale:** "Seja parceiro" conversa melhor com o tom esportivo/comunitario do site e evita parecer compra fria. "Divulgue sua empresa no Resenha" explica a oferta do jeito que um comercio local entende.

**Aplicacao sugerida:**

- Header/menus: `Parcerias`.
- Pagina: `Seja parceiro`.
- Hero comercial: `Sua empresa aparece no site e nas materias do Resenha`.
- CTA principal comercial: `Falar no WhatsApp`.
- CTA secundario comercial: `Ver onde minha empresa aparece`.

Para a jornada institucional, manter `Apoiar o Resenha`.

### Decision 3: A pagina de patrocinadores vira vitrine e ponte, nao formulario principal

Manter `/patrocinadores` como prova de credibilidade e vitrine de marcas existentes, evoluindo a pagina para explicar a diferenca entre:

- Patrocinadores/apoiadores do time.
- Parceiros comerciais do site.

**Rationale:** a pagina ja existe, tem dados do banco e e um ponto natural de descoberta. Ela nao deve virar uma pagina comercial pesada; deve mostrar quem ja esta junto, valorizar parceiros e direcionar para as duas jornadas certas.

### Decision 4: Home com monetizacao discreta e editorial em primeiro lugar

Na home, manter a ordem editorial/esportiva como prioridade:

1. Hero institucional.
2. Proximo jogo.
3. Patrocinadores em destaque quando houver.
4. Resultados.
5. Conteudo editorial.

Adicionar apenas um CTA ou strip discreto apos a vitrine de patrocinadores ou proximo aos posts, evitando multiplos blocos comerciais no primeiro viewport.

**Rationale:** a home e a capa do clube. A monetizacao deve aparecer como convite natural, nao como interrupcao.

### Decision 5: WhatsApp como conversao principal

Na jornada comercial, Fase 1 deve tratar WhatsApp como acao principal e formulario como alternativa secundaria.

- CTA principal abre WhatsApp com mensagem pre-preenchida.
- Formulario aparece depois, para quem prefere deixar dados.
- Eventos de analytics registram cliques no WhatsApp e envio do formulario.
- Endpoint/e-mail/CRM podem evoluir depois, sem travar a primeira venda.

**Rationale:** donos de pequenos comercios decidem pelo celular e preferem conversa direta. Pedir formulario longo antes de mostrar valor cria friccao e reduz chance de contato.

### Decision 6: Oferta simples antes de planos

A jornada comercial deve abrir com uma oferta de entrada simples, nao com tres planos complexos:

- Oferta base: `Aparecer no Resenha`.
- Inclui card na pagina de parceiros, logo/nome, texto curto e link para WhatsApp, Instagram ou site.
- Extras opcionais: materia com oferecimento, parceiro da rodada, destaque maior.

**Rationale:** comercios locais precisam entender rapido "quanto mais ou menos eu ganho?" e "onde apareco?". Uma oferta inicial reduz medo de pacote caro e deixa a negociacao humana para o WhatsApp.

### Decision 7: Componentes reutilizaveis antes de dados complexos

Criar componentes com conteudo configuravel via arrays locais na Fase 1:

- `PartnerCard`
- `OfferBlock`
- `PartnerBadge`
- `LogoSection`
- `CtaStrip`
- `CommercialInviteBanner`
- `PlanCard`
- `EmbeddedLeadForm`
- `FaqBlock`
- `InstitutionalMiniSection`
- `AdvertiseWithUsBlock`
- `PartnerLink`
- `PremiumPartnerHighlight`

**Rationale:** a base visual e mais importante no primeiro lancamento. Persistencia e admin podem vir na Fase 2, quando os campos comerciais estiverem validados.

## Architecture

### Rotas propostas

#### `/apoiar-o-resenha`

Pagina de apoio institucional/esportivo.

**Objetivo:** captar interessados em apoiar o time, a estrutura esportiva, a comunidade e o projeto do clube.

**Usuarios-alvo:**

- Torcedores, amigos, familiares e comunidade.
- Ex-atletas, moradores da regiao e simpatizantes.
- Empresas que querem apoiar o clube enquanto instituicao esportiva.
- Parceiros offline interessados em cota do time, material, eventos, uniforme ou apoio recorrente.

**Intencao emocional:** "quero fazer parte da caminhada do clube".

**Promessa:** ajudar o Resenha a manter calendario, estrutura, materiais, presenca e evolucao esportiva.

**CTA principal:** `Quero apoiar o Resenha`.

**CTA secundario:** `Entender formas de apoio`.

#### `/seja-parceiro`

Pagina comercial simples para donos de comercios locais que querem divulgar a empresa no site do Resenha.

**Objetivo:** fazer o comerciante entender onde a empresa aparece e chamar o Resenha no WhatsApp.

**Usuarios-alvo:**

- Donos de pizzaria, bar, academia, loja, mercado, oficina, clinica e servicos locais.
- Comerciantes da cidade/regiao que decidem rapido pelo celular.
- Pessoas que querem ver exemplo concreto antes de ler explicacao.

**Intencao comercial:** "quero que quem acompanha o Resenha veja minha empresa".

**Promessa:** sua empresa pode aparecer nas materias, jogos e pagina de parceiros do Resenha, com link para WhatsApp, Instagram ou site.

**CTA principal:** `Chamar no WhatsApp`.

**CTA secundario:** `Ver onde minha empresa aparece`.

#### `/patrocinadores`

Pagina existente evoluida.

**Objetivo:** servir como vitrine de credibilidade e inventario publico de marcas parceiras, direcionando para apoio ou parceria comercial conforme a intencao.

**CTAs recomendados:**

- `Apoiar o time` -> `/apoiar-o-resenha`
- `Divulgar minha empresa` -> `/seja-parceiro`

#### `/contato`

Mantem papel generalista para amistosos, imprensa, assuntos institucionais e duvidas, mas nao deve ser a rota principal das jornadas de monetizacao.

### Navegacao e descoberta

#### Header desktop

Recomendacao:

- Manter `Patrocinadores` na navegacao principal ou renomear para `Parceiros` se houver espaco.
- Manter apenas um CTA comercial no grupo de botoes, preferencialmente `Parcerias` apontando para `/seja-parceiro`.
- Incluir `Apoiar` como link secundario no menu mobile ou no dropdown/footer, nao como segundo botao primario no header desktop.

**Por que:** dois botoes fortes no header competiriam com agenda/conteudo e poderiam poluir. A jornada comercial tende a ser a de maior valor financeiro direto; o apoio institucional pode aparecer em topbar, footer e pagina de patrocinadores.

#### Header mobile

No menu aberto:

- Lista de navegacao editorial permanece primeiro.
- Em seguida, dois botoes empilhados:
  - `Apoiar o Resenha`
  - `Seja parceiro`

**Por que:** no mobile, a intencao do menu e exploratoria; os dois caminhos ficam claros sem ocupar o header fechado.

#### Topbar

Trocar ou alternar o link atual `Ver parceiros oficiais` por:

- `Parceiros oficiais` -> `/patrocinadores`
- Em campanhas pontuais: `Apoie o Resenha` -> `/apoiar-o-resenha`

Nao usar frases longas na topbar.

#### Footer

Criar uma coluna/bloco `Apoio e parcerias` com:

- `Apoiar o Resenha`
- `Seja parceiro`
- `Patrocinadores oficiais`
- `Contato`

Manter o card atual de "Seja parceiro", mas ajustar copy para separar:

- Uma linha emocional: "Quer fortalecer o clube?"
- Uma linha comercial: "Quer divulgar sua empresa no site do Resenha?"
- Dois links pequenos ou um CTA principal para `/seja-parceiro` e link secundario para `/apoiar-o-resenha`.

#### Home

Insercoes recomendadas:

- Hero: manter no maximo um CTA monetizavel. Se houver `Seja parceiro`, ele deve ficar como botao secundario/terciario, nao substituir `Ver elenco` e `Agenda`.
- Apos `SponsorsMarquee`: adicionar `CtaStrip` curto com duas opcoes, se a pagina tiver patrocinadores ativos.
- Perto de `LatestPosts`: adicionar `CommercialInviteBanner` discreto apenas se nao houver patrocinadores suficientes ou se a vitrine estiver abaixo da dobra.

Evitar:

- Pop-ups comerciais.
- Banner fixo no topo.
- Mais de uma chamada comercial por viewport.
- Cards de plano na home.

## Page Specification: Apoiar o Resenha

### Objetivo

Captar apoio institucional/esportivo para o time e reforcar comunidade, pertencimento e continuidade do projeto.

### Posicionamento

O apoio ao Resenha e uma forma de fortalecer o clube dentro e fora de campo/quadra. A pagina deve transmitir que o apoiador ajuda em estrutura, materiais, calendario, comunicacao, competicoes e manutencao do projeto.

Nao vender como "anuncio". Quando houver visibilidade, tratar como reconhecimento, nao como inventario de midia.

### Hierarquia da pagina

1. Hero institucional.
2. Blocos de valor: no que o apoio ajuda.
3. Formas de apoio.
4. Beneficios/reconhecimento para apoiadores.
5. Mini secao de credibilidade: clube, calendario, conteudo, comunidade.
6. Formulario de interesse.
7. FAQ.
8. CTA final.

### Hero

**Badge:** `Apoio ao clube`

**Headline recomendada:** `Ajude o Resenha a seguir em campo, em quadra e na comunidade.`

**Subtitulo:** `O apoio ao Resenha fortalece a estrutura do time, ajuda na rotina esportiva e mantem viva uma cobertura feita com identidade, organizacao e respeito pela nossa historia.`

**CTA principal:** `Quero apoiar o Resenha`

**CTA secundario:** `Ver formas de apoio`

**Visual:**

- Usar o mesmo padrao de hero das paginas internas: fundo `bg-navy-950`, card/box escuro com borda `border-navy-800`, brilho sutil azul/dourado e badge.
- Imagem/visual principal pode usar escudo do Resenha, foto de jogo/treino se existir, ou composicao com escudo e marcadores de "Campo", "Quadra", "Comunidade".
- Evitar visual de vaquinha generica, icones de dinheiro em excesso ou estetica filantropica.

### Blocos de valor

Usar 3 ou 4 cards pequenos, no padrao dos pilares do hero atual.

Cards sugeridos:

- `Estrutura do time`: ajuda em materiais, inscricoes, logistica e rotina de jogos.
- `Campo e quadra`: fortalece as duas frentes do Resenha, sem separar a identidade do clube.
- `Conteudo e memoria`: ajuda a manter registros, materias, fotos e cobertura do projeto.
- `Comunidade`: aproxima quem torce, joga, acompanha e acredita no clube.

### Formas de apoio

Apresentar como opcoes flexiveis, nao planos fechados.

- `Apoio pontual`: contribuicao ou ajuda especifica para uma necessidade.
- `Apoio recorrente`: apoio combinado para manter a rotina do clube.
- `Patrocinio institucional`: marca/empresa apoiando diretamente o projeto esportivo.
- `Apoio em produto ou servico`: materiais, alimentacao, transporte, impressos, estrutura, fotos, equipamentos ou servicos.

### Beneficios para apoiadores

Escrever como reconhecimento, com linguagem simples:

- Nome ou marca na pagina de apoiadores/patrocinadores, quando fizer sentido.
- Agradecimento em conteudos institucionais.
- Possibilidade de aparecer em acoes do clube.
- Aproximacao com uma comunidade esportiva local.
- Relacao direta com a diretoria/responsaveis do projeto.

Evitar prometer:

- Numero garantido de visualizacoes.
- Exclusividade sem negociacao.
- Resultados esportivos.
- ROI comercial direto.

### Formulario ideal

Campos:

- `Nome` obrigatorio.
- `Empresa ou projeto` opcional.
- `WhatsApp` obrigatorio.
- `E-mail` opcional.
- `Cidade/regiao` opcional.
- `Tipo de apoio` obrigatorio.
- `Como quer apoiar?` obrigatorio.
- `Mensagem` opcional.
- `Consentimento de contato` obrigatorio.

Opcoes para `Tipo de apoio`:

- `Apoio pontual`
- `Apoio recorrente`
- `Patrocinio institucional`
- `Produto ou servico`
- `Quero conversar antes`

### Copy de formulario

**Titulo:** `Fale com o Resenha sobre apoio ao clube`

**Texto de apoio:** `Conte rapidamente como voce quer ajudar. A gente retorna pelo WhatsApp para entender o melhor formato.`

**Placeholder mensagem:** `Ex: Tenho interesse em apoiar materiais de jogo, ajudar em uma rodada especifica ou conversar sobre patrocinio do time.`

**Botao:** `Enviar interesse de apoio`

**Microcopy abaixo do botao:** `Sem compromisso. O contato serve para entender a melhor forma de apoio antes de qualquer combinacao.`

### Mensagens de erro

- Nome: `Informe seu nome para sabermos com quem falar.`
- WhatsApp: `Informe um WhatsApp valido com DDD.`
- Tipo de apoio: `Escolha uma forma de apoio ou selecione "Quero conversar antes".`
- Mensagem principal: `Escreva em poucas palavras como voce imagina o apoio.`
- Consentimento: `Confirme que podemos entrar em contato sobre o apoio.`

### Mensagem de sucesso

`Recebemos seu interesse em apoiar o Resenha. Em breve vamos chamar no WhatsApp para conversar com calma sobre o melhor formato.`

### FAQ sugerido

**O apoio e so para empresas?**  
Nao. Pessoas, amigos, familiares, torcedores e empresas podem apoiar.

**Preciso fechar um valor agora?**  
Nao. O primeiro passo e conversar para entender o tipo de apoio.

**O apoio aparece no site?**  
Pode aparecer como reconhecimento, dependendo do formato combinado.

**Isso e a mesma coisa que anunciar no site?**  
Nao. Apoiar o Resenha fortalece o clube. Para visibilidade comercial no portal, o caminho ideal e `Seja parceiro`.

**Posso apoiar com produto ou servico?**  
Sim. Materiais, transporte, alimentacao, estrutura, impressos, equipamentos e servicos podem fazer sentido.

## Page Specification: Seja parceiro

### Principio de conversao

A pagina comercial deve vender para donos de comercios locais em poucos segundos. O dono de pizzaria, bar, academia, loja, oficina, mercado ou servico da regiao precisa entender sem esforco:

1. Onde a empresa dele aparece.
2. Quem acompanha e pode ver.
3. Por que isso faz sentido para um negocio local.
4. Como chamar o Resenha agora.

O texto deve usar linguagem de balcaco, bairro e futebol. Evitar termos como `presenca digital`, `ativo de midia`, `exposicao de marca`, `inventario`, `performance`, `awareness` ou `estrategia omnichannel`. A pessoa nao esta comprando uma tese de marketing; ela esta decidindo se vale a pena chamar no WhatsApp.

### Naming ideal

Pagina: `Seja parceiro`

Slug: `/seja-parceiro`

Rotulo direto dentro da pagina: `Divulgue sua empresa no Resenha`

**Por que:** `Seja parceiro` combina com o clube. `Divulgue sua empresa no Resenha` explica a venda de forma concreta para comercio local.

### Objetivo

Fazer o dono de um comercio local chamar o Resenha no WhatsApp para anunciar no site, entendendo rapidamente onde a empresa pode aparecer e como a conversa comeca.

### Usuario-alvo

- Dono de pizzaria, bar, hamburgueria, academia, loja, mercado, oficina, clinica, distribuidora ou servico local.
- Pessoa com pouco tempo, que decide pelo celular.
- Pessoa que quer saber "onde minha empresa aparece?" antes de ler textos longos.
- Pessoa que confia mais em exemplos visuais do que em explicacao tecnica.

### Hero

**Badge:** `Para comercios da regiao`

**Headline principal:** `Sua empresa aparece no site e nas materias do Resenha.`

**Subheadline:** `Quem acompanha jogos, entrevistas, cronicas e parceiros do clube pode ver sua empresa e chamar voce pelo WhatsApp ou Instagram.`

**Texto curto de apoio:** `Comece simples: a gente mostra os espacos, combina onde sua empresa entra e publica dentro do visual do Resenha.`

**CTA principal:** `Falar no WhatsApp`

**CTA principal alternativo:** `Quero divulgar minha empresa`

**CTA secundario:** `Ver onde minha empresa aparece`

**CTA terciario discreto:** `Prefiro deixar meus dados`

**Regra de conversao:** o botao principal deve abrir WhatsApp ou levar diretamente ao contato por WhatsApp. O formulario e secundario.

### Visual do hero

O usuario deve ver antes de ler. O hero deve mostrar uma composicao visual com exemplos reais ou fieis ao site:

- Print/preview de uma materia com um bloco `Oferecimento`.
- Print/preview da pagina de patrocinadores/parceiros com um card de empresa.
- Mini preview de uma chamada de jogo/rodada com espaco de parceiro.
- Logo do Resenha e etiqueta `Portal oficial`.

Se ainda nao houver prints finais, criar mockups usando componentes reais do site, nao layouts genericos. O visual precisa parecer uma tela do Resenha, com a mesma paleta, cards, bordas, badges e tipografia.

### Secoes principais

#### Onde sua empresa aparece

Esta deve ser a primeira grande secao apos o hero.

Formato recomendado:

- Grid de 3 cards visuais com imagem/preview no topo.
- Titulo curto.
- Frase concreta.
- CTA pequeno quando fizer sentido.

Cards:

1. `Nas materias do Resenha`
   - Copy: `Sua empresa aparece em uma materia, entrevista, cronica ou conteudo combinado do clube.`
   - Exemplo visual: `Oferecimento: Pizzaria Boa Massa`.

2. `Na pagina de parceiros`
   - Copy: `Sua empresa ganha um card com logo ou nome, texto curto e link para WhatsApp, Instagram ou site.`
   - Exemplo visual: card de patrocinador/parceiro no estilo atual.

3. `Em conteudos de jogo`
   - Copy: `Quando combinado, sua empresa aparece em chamada de rodada, pre-jogo ou pos-jogo.`
   - Exemplo visual: card de jogo com badge `Parceiro da rodada: Academia Movimento`.

Microcopy obrigatoria: `Os espacos dependem do combinado e do calendario do Resenha.`

#### Quem vai ver sua empresa

Explicar sem inflar numeros.

Copy recomendada:

`Quem acompanha o Resenha entra no site para ver jogos, resultados, materias, entrevistas, cronicas, fotos e parceiros do clube. Sua empresa aparece nesse caminho, perto de conteudo real do time.`

Bullets simples:

- Jogadores, familiares e amigos do clube.
- Torcedores e pessoas que acompanham o futebol amador da regiao.
- Comercios, parceiros e gente proxima do Resenha.
- Pessoas que chegam pelo site, pelos jogos, pela galeria e pelos conteudos do clube.

Nao usar `publico qualificado`, `audiencia`, `funil`, `impressao` ou `alcance` sem dados reais.

#### Por que anunciar aqui

Copy de abertura:

`O Resenha nao e uma pagina solta de anuncio. E o site de um time local, com jogos, materias, entrevistas, cronicas, fotos e parceiros. Sua empresa entra nesse ambiente, junto de um projeto que a comunidade ja reconhece.`

Argumentos:

- `E local`: fala com gente da regiao e com quem acompanha o clube.
- `Tem conteudo de verdade`: jogos, resultados, materias, entrevistas e cronicas.
- `Tem frequencia`: o site continua recebendo conteudo durante a temporada.
- `Tem organizacao`: sua empresa aparece em uma pagina oficial, com card, texto e link.
- `Tem relacao com o time`: sua empresa fica perto de um projeto esportivo com identidade.

#### Diferenca entre apoiar o time e anunciar no site

**Apoiar o time**

- Ajuda o Resenha como clube.
- Pode envolver material, estrutura, uniforme, jogos ou apoio ao projeto.
- O foco e fortalecer o time.
- CTA: `Quero apoiar o time`

**Anunciar no site**

- Coloca sua empresa no site e nos conteudos combinados.
- Pode ter logo, texto curto e link para WhatsApp ou Instagram.
- O foco e fazer quem acompanha o Resenha conhecer sua empresa.
- CTA: `Quero divulgar minha empresa`

#### Prova de confianca

- `O Resenha ja tem materias, entrevistas e cronicas publicadas.`
- `O site mostra jogos, resultados, elenco, galeria e parceiros.`
- `Sua empresa aparece dentro de um projeto local com identidade propria.`
- `O clube ja tem uma pagina oficial para parceiros.`

Se houver numeros reais no futuro, mostrar de forma simples:

- `X acessos no mes`
- `X materias publicadas`
- `X cliques em parceiros`
- `X seguidores`

Sem numero real, nao inventar.

### Planos

Nao abrir com tres planos. Comecar com uma oferta de entrada facil e ajustes opcionais.

#### Opcao principal: Aparecer no Resenha

**Nome no card:** `Aparecer no Resenha`

**Descricao:** `Sua empresa entra na pagina de parceiros do clube, com logo ou nome, texto curto e link para WhatsApp, Instagram ou site.`

**Frequencia/periodo:** `Fica no ar pelo periodo combinado.`

**Inclui base sugerida:**

- Card da empresa na pagina de parceiros.
- Logo ou nome da empresa.
- Texto curto dizendo o que a empresa faz.
- Link para WhatsApp, Instagram ou site.

**CTA:** `Quero aparecer no Resenha`

#### Extra: Aparecer em materia

**Nome no card:** `Aparecer em materia`

**Descricao:** `Sua empresa aparece em uma materia, entrevista, cronica ou conteudo combinado.`

**Frequencia/periodo:** `Usado em um conteudo combinado.`

**CTA:** `Perguntar pelo WhatsApp`

#### Extra: Parceiro da rodada

**Nome no card:** `Parceiro da rodada`

**Descricao:** `Sua empresa aparece em conteudo de jogo, pre-jogo, pos-jogo ou chamada de rodada, quando houver espaco combinado.`

**Frequencia/periodo:** `Usado em uma rodada ou periodo combinado.`

**CTA:** `Perguntar pelo WhatsApp`

#### Extra: Destaque maior

**Nome no card:** `Destaque maior`

**Descricao:** `Sua empresa ganha mais destaque na pagina de parceiros ou em uma secao combinada do site.`

**Frequencia/periodo:** `Fica no ar pelo periodo combinado.`

**CTA:** `Perguntar pelo WhatsApp`

**Microcopy para a secao:** `Nao precisa fechar um pacote grande. Chame no WhatsApp e veja o formato mais simples para sua empresa.`

### Exemplos de copy para demonstrar o anuncio

Mostrar frases reais dentro dos previews:

- `Oferecimento: Pizzaria Boa Massa`
- `Parceiro da rodada: Academia Movimento`
- `Conheca a Barbearia Central, parceira do Resenha`
- `Peca pelo WhatsApp`
- `Ver Instagram`
- `Abrir WhatsApp`

Esses exemplos ajudam o comerciante a imaginar a propria empresa no site.

### CTAs

O CTA principal da pagina deve ser WhatsApp.

CTAs recomendados:

- `Falar no WhatsApp`
- `Quero divulgar minha empresa`
- `Quero aparecer no Resenha`
- `Ver onde minha empresa aparece`
- `Falar com o Resenha`
- `Mandar mensagem agora`
- `Deixar meus dados`

Evitar CTAs frios:

- `Solicitar proposta`
- `Enviar interesse comercial`
- `Consultar planos`
- `Contratar midia`
- `Fale com vendas`

Comportamento recomendado:

- Hero: botao primario abre WhatsApp.
- Cards de exemplo: CTA ancora para secao visual ou abre WhatsApp.
- Oferta inicial: CTA abre WhatsApp.
- Formulario: aparece depois, com titulo `Prefere deixar seus dados?`.

Mensagem pre-preenchida sugerida para WhatsApp:

`Oi, Resenha! Quero divulgar minha empresa no site. Minha empresa e [nome] e queria ver onde ela pode aparecer.`

### Formulario

O formulario nao deve ser a acao principal. Ele deve existir para quem nao quer chamar agora.

**Titulo:** `Prefere deixar seus dados?`

**Texto:** `Preencha o basico e o Resenha chama voce no WhatsApp. E so um primeiro contato, sem compromisso.`

Campos:

- Label: `Seu nome`
  - Placeholder: `Ex: Joao`
- Label: `Nome da empresa`
  - Placeholder: `Ex: Pizzaria Boa Massa`
- Label: `WhatsApp`
  - Placeholder: `Ex: (11) 99999-9999`
- Label: `Tipo de negocio`
  - Placeholder: `Ex: pizzaria, bar, academia, loja`
- Label: `Instagram ou site`
  - Placeholder: `Ex: @suaempresa ou seusite.com.br`
- Label: `Onde voce quer aparecer?`
  - Placeholder: `Escolha uma opcao`
- Label: `Mensagem`
  - Placeholder: `Conte em uma frase o que sua empresa vende ou onde atende.`
- `Consentimento de contato` obrigatorio.

Opcoes para `Onde voce quer aparecer?`:

- `Aparecer na pagina de parceiros`
- `Aparecer em uma materia`
- `Aparecer em conteudo de jogo`
- `Quero comecar simples`
- `Nao sei ainda, quero conversar`

**Botao:** `Pedir contato pelo WhatsApp`

**Microcopy:** `Nao precisa decidir agora. A conversa serve para mostrar os espacos e combinar um formato simples.`

### Mensagens de erro

- Nome: `Informe seu nome.`
- Empresa: `Informe o nome da sua empresa.`
- WhatsApp: `Informe um WhatsApp com DDD.`
- Onde voce quer aparecer: `Escolha uma opcao ou marque que quer conversar.`
- Consentimento: `Confirme que o Resenha pode chamar voce no WhatsApp.`

### Mensagem de sucesso

`Pronto. Recebemos seus dados e vamos chamar voce no WhatsApp para mostrar onde sua empresa pode aparecer.`

### FAQ

**Onde minha empresa aparece?**  
Pode aparecer na pagina de parceiros, em materias combinadas e em conteudos de jogo. O Resenha mostra os espacos e combina com voce antes de publicar.

**Quem vai ver minha empresa?**  
Jogadores, familiares, amigos, torcedores, parceiros e pessoas da regiao que entram para ver jogos, materias, fotos e informacoes do Resenha.

**Precisa fechar pacote grande?**  
Nao. Da para comecar simples, com a empresa na pagina de parceiros, e depois combinar outros espacos se fizer sentido.

**Da para colocar meu WhatsApp ou Instagram?**  
Sim. O card da empresa pode levar direto para WhatsApp, Instagram ou site.

**Precisa ter contrato?**  
Para formatos simples, o combinado pode comecar pela conversa com o Resenha. Se a parceria for maior ou por mais tempo, o clube pode formalizar o que foi combinado.

**Como funciona depois que eu chamo?**  
Voce chama no WhatsApp, o Resenha mostra onde sua empresa pode aparecer, combina o formato, recebe logo/texto/link e publica no site.

**Isso e a mesma coisa que apoiar o time?**  
Nao. Anunciar no site e para divulgar sua empresa. Apoiar o time e para ajudar diretamente o clube, materiais, estrutura ou projeto esportivo.

**Como eu entro?**  
Clique em `Falar no WhatsApp` ou deixe seus dados no formulario. O Resenha chama voce e combina o proximo passo.

## Components And Sections

### PartnerCard

**Objetivo:** exibir uma marca parceira com logo, nome, tipo de parceria, descricao curta e link.

**Quando usar:** pagina de parceiros, blocos comerciais, plano premium, vitrine institucional.

**Quando nao usar:** listas muito densas de logos simples; nesse caso usar `LogoSection`.

**Comportamento:**

- Se tiver `href`, card inteiro pode ser clicavel.
- Se nao tiver logo, usar fallback visual com iniciais, como `SponsorBrandTile`.
- Mostrar badge `Parceiro`, `Apoio`, `Premium`, `Oferecimento` ou cota.

**Estados:**

- Default.
- Hover com leve elevacao e borda azul/dourada.
- Sem logo.
- Sem link.
- Premium.

**Conteudo:**

- Nome da marca.
- Logo.
- Descricao curta.
- Link/CTA: `Visitar marca`, `Conhecer parceiro`, `Abrir Instagram`.

**Responsividade:**

- Mobile: 1 coluna, logo em topo ou lateral compacta.
- Tablet: 2 colunas.
- Desktop: 2 ou 3 colunas conforme contexto.

**Visual:**

- Reusar `rounded-[24px]` ou `rounded-[26px]`, borda `border-navy-800`, fundo `bg-navy-950/80`.
- Premium pode usar borda `gold-400/25` e brilho dourado sutil.

### OfferBlock

**Objetivo:** sinalizar oferecimento comercial em conteudo editorial sem parecer anuncio invasivo.

**Quando usar:** materias, cronicas, pre-jogo, pos-jogo, bloco de rodada.

**Quando nao usar:** todos os posts por padrao; usar apenas quando houver parceiro associado.

**Comportamento:**

- Pequeno bloco antes ou depois do conteudo principal.
- Texto claro: `Oferecimento`.
- Logo e link opcionais.

**Copy sugerida:**

- `Este conteudo tem oferecimento de [Marca].`
- `Apoio de quem fortalece a cobertura do Resenha.`

**Visual:**

- Densidade baixa.
- Border-top ou card discreto.
- Nao competir com titulo da materia.

### PartnerBadge

**Objetivo:** identificar tipo de relacao da marca.

**Variantes:**

- `Parceiro`
- `Apoio`
- `Patrocinador`
- `Oferecimento`
- `Premium`
- `Rodada`

**Visual:** derivar de `Badge`, com variantes accent/gold/outline.

### LogoSection

**Objetivo:** agrupar logos de parceiros com baixo peso visual.

**Quando usar:** home, patrocinadores, rodape de paginas comerciais.

**Quando nao usar:** quando cada parceiro precisa de explicacao individual.

**Comportamento:** grid estatico ou marquee existente; pausar marquee no hover; logos com alt text.

### CtaStrip

**Objetivo:** convite horizontal curto para direcionar o usuario.

**Quando usar:** entre secoes da home, final de paginas, apos vitrine de parceiros.

**Copy sugerida:**

- `Quer fortalecer o clube ou divulgar sua marca?`
- Botao 1: `Apoiar o Resenha`
- Botao 2: `Seja parceiro`

**Visual:** faixa escura, borda fina, badge pequeno, sem imagem grande.

### CommercialInviteBanner

**Objetivo:** chamada comercial discreta dentro da experiencia editorial.

**Quando usar:** listagem de blog, pagina de patrocinadores, fim de materias selecionadas.

**Quando nao usar:** no topo de toda pagina ou entre cada card editorial.

**Copy sugerida:**

- `Sua marca tambem pode aparecer na cobertura do Resenha.`
- `Formatos simples para comercios locais e parceiros da regiao.`

### CommercialOfferCard

**Objetivo:** apresentar a oferta simples `Aparecer no Resenha` e extras opcionais sem parecer tabela de planos.

**Conteudo:**

- Nome da oferta ou extra.
- Frase direta sobre onde a empresa aparece.
- Lista curta de inclusoes.
- Microcopy `Chame no WhatsApp para combinar`.
- CTA de WhatsApp.

**Estados:**

- Oferta base.
- Extra opcional.
- Destaque maior, quando houver parceiro premium.

**Visual:** cards no padrao dark, sem tabela corporativa, maximo 4 bullets por card.

### EmbeddedLeadForm

**Objetivo:** capturar leads das duas jornadas com layout consistente.

**Variantes:**

- `support`
- `commercial`

**Comportamento:**

- Validacao client-side.
- Mensagens de erro proximas ao campo.
- Estado enviando.
- Estado sucesso.
- Estado erro geral.
- Possibilidade futura de POST para API, email e CRM.

**Mobile:**

- Campos em uma coluna.
- Inputs com altura minima de 44px.
- CTA full-width.
- Evitar selects longos demais sem labels persistentes.

### FaqBlock

**Objetivo:** reduzir duvidas e separar expectativas.

**Quando usar:** final das duas paginas.

**Visual:** acordeao ou cards simples; se nao houver componente acordeao, usar lista de cards.

### InstitutionalMiniSection

**Objetivo:** lembrar o contexto do clube sem repetir a home.

**Conteudo:** fundado em 2023, campo e quadra, portal oficial, conteudo e calendario.

### AdvertiseWithUsBlock

**Objetivo:** bloco reutilizavel para listagens editoriais e paginas internas.

**Copy:** `Anuncie com o Resenha` deve aparecer apenas onde a intencao comercial e clara. Preferir `Seja parceiro` na maior parte do site.

### PartnerLink

**Objetivo:** link clicavel para marca parceira com tracking.

**Comportamento:**

- `target="_blank"` quando URL externa.
- `rel="noreferrer"` ou `noopener noreferrer`.
- Evento `partner_logo_click` ou equivalente.
- Label acessivel com nome da marca.

### PremiumPartnerHighlight

**Objetivo:** destaque maior para parceiro premium sem quebrar layout.

**Quando usar:** pagina de parceiros e, com parcimonia, home.

**Visual:** card largo com logo, descricao, CTA, badge `Premium`, borda dourada sutil. Nunca usar animacao agressiva ou banner piscante.

## Visual Positioning

### Principios obrigatorios

- A monetizacao deve parecer parte do produto editorial/esportivo.
- Nada deve parecer template comercial generico.
- Nada deve parecer modulo externo colado no site.
- O conteudo esportivo continua com prioridade visual.
- Cards, bordas, badges, sombras, gradientes e CTAs devem seguir o padrao atual.
- O site deve seguir com aparencia forte, limpa, moderna, emocional e organizada.

### Design system atual a preservar

- Cores: `navy-950`, `navy-900`, `navy-800`, `blue-600/500/400`, `cream-100/300`, `gold-400`.
- Fontes: `Outfit` para display, `Inter` para texto.
- Botao: arredondado, azul ou outline, com icone `lucide-react`.
- Cards: escuros, borda sutil, raio entre `rounded-xl` e `rounded-[26px]` conforme pagina existente.
- Badges: uppercase pequeno, tracking alto, accent/gold/outline.
- Layout: `Container`, grids responsivos, secoes com padding vertical generoso.
- Imagens: escudo, fotos de jogo/galeria ou logos reais, sempre com tratamento coerente.

### Hierarquia visual

- Paginas de monetizacao devem ter hero forte, mas nao maior que a home.
- CTAs comerciais nao devem superar visualmente titulos editoriais.
- Em paginas editoriais, blocos comerciais devem ocupar posicoes secundarias.
- Em `/seja-parceiro`, a conversao pode ser prioridade porque a pagina e comercial.
- Em `/apoiar-o-resenha`, a emocao e a clareza devem vir antes do formulario.

### Espacamento

- Mobile: secoes com `py-12` a `py-16`; cards com `p-5` ou `p-6`.
- Desktop: secoes com `py-16` a `py-24`; cards com `p-6` a `p-10`.
- Grids: `gap-4` mobile, `gap-6`/`gap-8` desktop.
- Evitar empilhar muitos cards comerciais sem respiro.

### Densidade de informacao

- Hero: maximo 2 CTAs, 1 badge, 1 headline, 1 subtitulo.
- Planos: maximo 5 bullets por card.
- Formularios: dividir em grupos logicos; nao usar texto auxiliar em todos os campos.
- FAQ: 5 a 7 perguntas por pagina.

### Contraste

- Texto principal em `cream-100`.
- Texto secundario em `cream-300`.
- Fundo dos inputs em `navy-950`.
- Bordas em `navy-700/800`.
- Foco em `blue-400`.
- Dourado apenas para destaque, premium ou credibilidade; nao transformar tudo em dourado.

### Uso de imagens

- Preferir fotos reais de jogo, torcida, bastidores, galeria ou escudo.
- Se nao houver foto adequada, usar composicao visual com escudo e cards informativos, como a home atual.
- Nao usar banco de imagem generico de escritorio, marketing, handshake corporativo ou graficos abstratos.

### Blocos de cor

- Usar bandas `bg-navy-950` e `bg-navy-900/60`.
- Gradientes devem ser sutis e semelhantes aos existentes.
- Evitar fundos claros grandes, porque quebram a identidade atual.

### Equilibrio editorial/comercial

- Comercial aparece como `parceria`, `oferecimento`, `apoio`, `visibilidade`, nao como publicidade agressiva.
- Separar claramente "apoio ao clube" de "divulgacao da marca".
- Nao misturar logo de patrocinador em area que pareca materia editorial sem sinalizacao.

## Copy And Voice

### Tom de voz

- Local, direto, confiante e humano.
- Esportivo, moderno e organizado.
- Profissional sem ser corporativo demais.
- Emocional sem exagero.
- Sem promessa de alcance, retorno ou resultado sem dado.
- Sem jargao de agencia.

### Palavras recomendadas

- `clube`
- `campo`
- `quadra`
- `rodada`
- `cobertura`
- `comunidade`
- `parceiro`
- `apoio`
- `marca`
- `empresa`
- `negocio local`
- `regiao`
- `historia`
- `calendario`

### Evitar

- `solucao 360`
- `alta performance`
- `escale sua marca`
- `alcance garantido`
- `midia programatica`
- `audiencia qualificada` sem dado
- `patrocinio que vende mais`
- `o maior portal`

### CTAs

Para apoio:

- `Quero apoiar o Resenha`
- `Apoiar o clube`
- `Ver formas de apoio`
- `Enviar interesse de apoio`
- `Conversar sobre apoio`

Para parceria comercial:

- `Falar no WhatsApp`
- `Quero divulgar minha empresa`
- `Quero aparecer no Resenha`
- `Ver onde minha empresa aparece`
- `Falar com o Resenha`
- `Mandar mensagem agora`

Para patrocinadores:

- `Ver parceiros oficiais`
- `Conhecer parceiro`
- `Visitar marca`
- `Apoiar o time`
- `Divulgar minha empresa`

### Headlines sugeridas

Apoio:

- `Ajude o Resenha a seguir em campo, em quadra e na comunidade.`
- `O Resenha cresce quando a comunidade joga junto.`
- `Apoio que fortalece o clube por dentro.`

Parceria:

- `Sua empresa aparece no site e nas materias do Resenha.`
- `Sua empresa nas materias, jogos e pagina de parceiros do Resenha.`
- `Quem acompanha o Resenha tambem pode ver sua empresa.`

Patrocinadores:

- `Marcas que fortalecem o Resenha.`
- `Parceiros que ajudam a manter o projeto vivo.`
- `Quem joga junto com o Resenha fora das quatro linhas.`

### Microcopy de formulario

- `Sem compromisso. A gente retorna para conversar antes de qualquer proposta.`
- `Use um WhatsApp com DDD para facilitar o retorno.`
- `Se ainda nao sabe o formato ideal, escolha "Quero conversar antes".`
- `Nao precisa decidir agora. A conversa serve para mostrar os espacos e combinar um formato simples.`
- `Prefere nao chamar agora? Deixe seus dados e o Resenha chama voce.`

### Empty states

Pagina de patrocinadores sem marcas:

`Espaco aberto para os primeiros parceiros do Resenha. A vitrine ja esta pronta para receber marcas que queiram fortalecer o clube ou aparecer na cobertura.`

Sem planos configurados:

`Os formatos de parceria estao sendo ajustados. Envie seu interesse que a gente monta uma possibilidade simples para sua marca.`

Formulario indisponivel:

`O formulario esta temporariamente indisponivel. Chame o Resenha pelo WhatsApp para continuar a conversa.`

Sem logos:

`Logo em breve. Enquanto isso, a marca ja pode aparecer com nome e link oficial.`

## Forms

### Validacoes gerais

- Nome minimo: 2 caracteres.
- Empresa: obrigatoria apenas na jornada comercial.
- WhatsApp: obrigatorio, aceitar mascara com DDD e normalizar para numeros.
- E-mail: opcional, validar apenas se preenchido.
- Instagram: opcional, aceitar `@marca` ou URL.
- Site: opcional, validar URL completa se preenchido.
- Cidade/regiao: obrigatoria na jornada comercial, opcional na institucional.
- Mensagem: limite recomendado de 500 a 800 caracteres.
- Consentimento: checkbox obrigatorio.

### Comportamento mobile

- Inputs em uma coluna.
- Labels sempre visiveis.
- Placeholder como exemplo, nao substitui label.
- Botao full-width.
- Feedback de erro abaixo do campo.
- Scroll automatico para o primeiro erro apos submit.
- Evitar teclado inadequado: `tel` para WhatsApp, `email` para e-mail, `url` para site.

### Boas praticas de conversao

- Comecar por dados pessoais simples.
- Deixar campos sensiveis/opcionais por ultimo.
- Nao exigir orcamento na parceria comercial.
- Informar que o envio nao fecha compromisso.
- Em sucesso, orientar proximo passo pelo WhatsApp.
- Na parceria comercial, `Chamar no WhatsApp` deve ser o caminho principal.
- O formulario comercial deve entrar como alternativa secundaria: `Prefere deixar seus dados?`.

### Integracoes futuras

Fase 1:

- Endpoint simples `POST /api/leads` ou acionamento por WhatsApp/e-mail.
- Eventos de analytics.
- E-mail para responsavel comercial.

Fase 2:

- Tabela `leads` ou `partnership_inquiries`.
- Status de atendimento: `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`.
- Origem: `support_page`, `partner_page`, `sponsors_page`, `home_strip`, `footer`.
- Export CSV no admin.

Fase 3:

- Integracao CRM.
- Automacao de e-mail.
- Dashboard de conversao.
- Gestao de inventario comercial.

## Commercial Offer

### Estrutura recomendada

A pagina comercial deve apresentar uma oferta simples antes de qualquer lista de planos.

Oferta base: `Aparecer no Resenha`

Card da oferta deve ter:

- Badge pequeno: `Comece simples`.
- Titulo: `Aparecer no Resenha`.
- Frase direta: `Sua empresa entra na pagina de parceiros, com logo ou nome e link para WhatsApp, Instagram ou site.`
- Lista curta de inclusoes.
- Texto `Extras podem ser combinados pelo WhatsApp`.
- CTA principal: `Quero aparecer no Resenha`.

### Inclusoes da oferta base

- Card da empresa na pagina de parceiros.
- Logo ou nome da empresa.
- Texto curto explicando o que a empresa faz.
- Link para WhatsApp, Instagram ou site.
- Possibilidade de aparecer em uma secao de parceiros do site.

### Extras opcionais

Os extras devem aparecer como cards menores, nao como planos complexos:

- `Materia com oferecimento`: empresa aparece em uma materia combinada.
- `Parceiro da rodada`: empresa aparece em conteudo de jogo ou rodada.
- `Destaque maior`: card maior ou posicao destacada na pagina de parceiros.

### Regras de apresentacao

- Nao abrir com tabela de tres planos.
- Nao exibir valores fixos por padrao.
- Nao usar comparacao agressiva.
- Nao exigir orcamento para iniciar conversa.
- Usar WhatsApp como CTA principal em todos os cards comerciais.
- Incluir texto: `Chame no WhatsApp e veja o formato mais simples para sua empresa.`

## Existing Sponsors Area

### Evolucao recomendada

Transformar `/patrocinadores` em uma pagina de prova e escolha:

1. Hero: `Parceiros que fortalecem o Resenha`.
2. Texto curto explicando que ha apoio ao clube e parcerias comerciais.
3. Dois cards de trilha:
   - `Apoiar o time` -> `/apoiar-o-resenha`
   - `Divulgar minha empresa` -> `/seja-parceiro`
4. Lista agrupada de patrocinadores/parceiros existentes.
5. CTA final para as duas jornadas.

### Separacao de categorias

No curto prazo, usar labels/copy:

- `Patrocinadores oficiais do clube`
- `Parceiros da cobertura`
- `Apoiadores`

No banco atual, `tier` ainda e cota. Para Fase 1, nao e obrigatorio criar novo campo. A separacao pode ser por copy, descricao ou listas configuradas manualmente se necessario.

Fase 2 pode adicionar:

- `relationshipType`: `CLUB_SPONSOR`, `SITE_PARTNER`, `SUPPORTER`, `BOTH`.
- `placementTypes`: home, article, match, gallery, sponsor page.
- `startsAt`, `endsAt`, `contactName`, `contractNotes` se o admin comercial evoluir.

### Como usar como prova de credibilidade

- Mostrar logos reais com cuidado visual.
- Destacar que o Resenha ja tem vitrine oficial.
- Usar textos honestos: `marcas que caminham junto`, `parceiros oficiais`, `apoio ao projeto`.
- Nao inflar numeros.

## SEO And Discovery

### `/apoiar-o-resenha`

Title: `Apoiar o Resenha`

Description: `Saiba como apoiar o Resenha RFC e fortalecer o projeto esportivo do clube no campo, na quadra e na comunidade.`

Keywords adicionais:

- apoiar Resenha RFC
- apoio ao futebol amador
- patrocinio futebol amador
- apoiar time amador
- Resenha RFC apoio

Headings:

- H1: `Ajude o Resenha a seguir em campo, em quadra e na comunidade.`
- H2: `Como o apoio fortalece o clube`
- H2: `Formas de apoiar`
- H2: `Fale com o Resenha`
- H2: `Duvidas frequentes`

### `/seja-parceiro`

Title: `Seja parceiro`

Description: `Divulgue sua empresa no site do Resenha RFC e apareca em materias, jogos e na pagina de parceiros do clube.`

Keywords adicionais:

- anunciar no Resenha RFC
- anunciar no futebol amador
- divulgar empresa futebol local
- aparecer no site do Resenha
- comercio local esporte

Headings:

- H1: `Sua empresa aparece no site e nas materias do Resenha.`
- H2: `Onde sua empresa pode aparecer`
- H2: `Por que anunciar aqui`
- H2: `Como comecar`
- H2: `Fale com o Resenha`
- H2: `Duvidas frequentes`

### Semantica

- Uma unica tag H1 por pagina.
- Formularios com labels associados.
- Cards de planos como listas/sections com headings.
- Logos com alt text.
- Links externos com atributos adequados.
- Metadata usando `createPageMetadata`.

## Responsiveness

### Mobile-first

- Hero com conteudo em uma coluna.
- Cards empilhados.
- Formularios em uma coluna.
- CTAs full-width quando lado a lado ficar apertado.
- Menu mobile deve mostrar as duas jornadas de monetizacao com clareza.
- Evitar tabelas horizontais.

### Safe areas e toque

- Botoes e campos com altura minima de 44px.
- Espacamento lateral via `Container`.
- Nada importante colado na borda.
- Formularios sem elementos pequenos demais para toque.

### Prioridade de conteudo no mobile

Apoio:

1. O que e.
2. Como ajuda.
3. CTA/formulario.
4. FAQ.

Parceria:

1. Valor comercial.
2. Onde aparece.
3. Planos.
4. Formulario.
5. FAQ.

### Performance

- Evitar imagens pesadas especificas para essas paginas na Fase 1.
- Reusar escudo/logo e fotos ja otimizadas quando possivel.
- Componentes server-first sempre que possivel; formulario pode ser client component isolado.
- Nao adicionar bibliotecas novas para acordeao/form se componentes simples resolverem.

## Analytics And Validation

### Eventos recomendados

- `monetization_cta_click`
  - props: `label`, `source`, `destination`, `journey`
- `support_page_view`
  - props: `source`
- `partner_page_view`
  - props: `source`
- `support_form_start`
- `support_form_submit`
- `support_form_success`
- `support_form_error`
- `partner_form_start`
- `partner_form_submit`
- `partner_form_success`
- `partner_form_error`
- `partner_logo_click`
  - props: `partner_name`, `source`, `url`
- `plan_cta_click`
  - props: `plan_name`
- `faq_expand`
  - props: `page`, `question`
- `scroll_depth`
  - props: `page`, `percent`

### Fontes a rastrear

- `header`
- `mobile_menu`
- `footer`
- `home_hero`
- `home_sponsor_marquee`
- `home_cta_strip`
- `sponsors_page`
- `blog_post`
- `blog_index`

### Metricas de sucesso

Curto prazo:

- Cliques nos CTAs das duas jornadas.
- Taxa de envio dos formularios.
- Leads validos por mes.
- Origem dos leads.
- Cliques em logos de parceiros.

Medio prazo:

- Conversao lead -> conversa.
- Conversao conversa -> parceiro.
- CTR de blocos comerciais.
- Retencao de parceiros.
- Receita mensal ou apoio recorrente.

### Validacao qualitativa

- Leads entendem a diferenca entre apoiar e anunciar?
- Comercios pequenos acham a proposta acessivel?
- Patrocinadores atuais nao percebem conflito?
- O editorial continua com prioridade?
- Os responsaveis do clube conseguem explicar os planos em conversa?

## Roadmap

### Fase 1: Solucao minima validavel

Lancamento inicial com baixo risco e alto aprendizado.

Entregas:

- Criar `/apoiar-o-resenha`.
- Criar `/seja-parceiro`.
- Atualizar CTAs de header/mobile/footer.
- Atualizar `/patrocinadores` com cards de escolha entre apoio e parceria.
- Criar componentes base: CTA strip, oferta comercial simples, FAQ, forms, partner cards.
- Implementar formularios com validacao e destino simples.
- Adicionar metadata e eventos basicos.
- Nao criar admin comercial ainda.

Sucesso da Fase 1:

- Usuarios conseguem escolher a jornada certa.
- Formularios geram leads acionaveis.
- A home nao fica poluida.
- A pagina de patrocinadores vira prova e ponte.

### Fase 2: Evolucao comercial

Entregas:

- Persistir leads em banco.
- Adicionar status e origem no admin.
- Adicionar tipo de relacionamento nos patrocinadores/parceiros.
- Permitir configurar planos e textos pelo admin.
- Criar blocos de oferecimento em posts selecionados.
- Medir cliques em logos e CTAs por fonte.
- Adicionar numeros reais quando houver massa.

Sucesso da Fase 2:

- Responsaveis conseguem acompanhar leads.
- Parceiros podem ser classificados por tipo.
- Conteudos comerciais sao ativados sem edicao manual pesada.

### Fase 3: Refinamentos futuros

Entregas:

- Dashboard comercial.
- Relatorio simples para parceiros.
- Integracao CRM/e-mail/WhatsApp.
- Campanhas por rodada.
- Pacotes sazonais.
- Pagina individual de parceiro premium se houver demanda.
- Testes A/B de copy e CTAs.

Sucesso da Fase 3:

- O site opera como ativo comercial mensuravel.
- O clube tem processo de renovacao e prospeccao.
- Parceiros recebem valor percebido sem comprometer o editorial.

## Success Criteria

- Usuario distingue em menos de 10 segundos:
  - apoio ao clube;
  - parceria comercial/anuncio no site.
- Header e home mantem clareza editorial.
- Paginas novas seguem a identidade visual atual.
- Formularios funcionam bem em mobile.
- Toda copy evita promessa exagerada.
- CTAs sao rastreaveis por fonte.
- `/patrocinadores` vira vitrine de credibilidade e nao gargalo de conversao.
- A Fase 1 pode ser lancada sem mudanca obrigatoria no banco.

## Risks / Trade-offs

- [Risk] Confusao entre patrocinador do time e parceiro do site -> Mitigation: rotas separadas, copy explicita, FAQ e formularios distintos.
- [Risk] Home parecer comercial demais -> Mitigation: limitar chamadas comerciais a um strip/banner discreto e manter conteudo esportivo em primeiro plano.
- [Risk] Comercios pequenos se assustarem com planos -> Mitigation: planos sem preco fixo obrigatorio, linguagem flexivel e campo de orcamento opcional.
- [Risk] Prometer retorno sem dados -> Mitigation: usar prova qualitativa no inicio e adicionar metricas apenas quando confiaveis.
- [Risk] Componentes comerciais quebrarem identidade -> Mitigation: reaproveitar `Card`, `Badge`, `Button`, `Container`, paleta e raios existentes.
- [Risk] Formularios gerarem leads sem processo de retorno -> Mitigation: sucesso deve prometer contato por WhatsApp e Fase 1 precisa definir responsavel operacional.
- [Risk] Patrocinadores offline perceberem conflito -> Mitigation: posicionar apoio ao clube e parceria digital como trilhas complementares.
- [Risk] Long pages ficarem pesadas no mobile -> Mitigation: conteudo em secoes curtas, cards compactos, CTA recorrente mas nao excessivo.

## Implementation Notes

### Estrutura sugerida de arquivos

- `apps/web/src/app/(public)/apoiar-o-resenha/page.tsx`
- `apps/web/src/app/(public)/seja-parceiro/page.tsx`
- `apps/web/src/components/monetization/CtaStrip.tsx`
- `apps/web/src/components/monetization/PlanCard.tsx`
- `apps/web/src/components/monetization/FaqBlock.tsx`
- `apps/web/src/components/monetization/LeadForm.tsx`
- `apps/web/src/components/monetization/PartnerCard.tsx`
- `apps/web/src/components/monetization/OfferBlock.tsx`
- `apps/web/src/components/monetization/CommercialInviteBanner.tsx`
- `apps/web/src/lib/analytics.ts` ou helper equivalente, se ainda nao existir.

### Dependencias

Nao adicionar novas dependencias na Fase 1, salvo se o projeto ja tiver uma lib de formularios/analytics aprovada. Formularios podem usar React state, Zod existente em `@resenha/validators` ou validacao local simples antes de extrair schema compartilhado.

### Acessibilidade

- Labels visiveis.
- Estados de foco.
- Erros associados ao campo.
- Alt text de logos.
- Sem depender apenas de cor para diferenciar apoio/parceria.
- Links e botoes com texto descritivo.

### Criterios de pronto para implementacao

- As duas paginas novas existem e sao navegaveis.
- Cada formulario tem validacao, estado de sucesso e erro.
- CTAs principais apontam para a rota certa.
- `/patrocinadores` direciona as duas jornadas.
- Metadata e headings estao configurados.
- Eventos basicos sao disparados ou, se analytics ainda nao existir, estao encapsulados em helper no-op para ativacao futura.
- Layout foi verificado em mobile e desktop.
