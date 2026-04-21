## Why

Os canais de contato precisam separar o que e assunto do time do que e assunto do site, porque hoje o site centraliza tudo no telefone pessoal `17 99673-5427`. A tabela do campeonato tambem esta divergente da fonte oficial da cidade no Placarsoft, o que pode mostrar posicoes, jogos e resultados incorretos para torcedores e atletas.

## What Changes

- Centralizar os canais oficiais em um helper/configuracao unica para evitar numeros e e-mails divergentes no site.
- Roteiar assuntos do time para o WhatsApp `17 99658-2337` (`5517996582337`) e para o e-mail `warface01031999@gmail.com`.
- Manter o contato do site/administracao tecnica como `17 99673-5427` (`5517996735427`) quando a mensagem for sobre o proprio site, parceria comercial para aparecer no site, suporte ou manutencao.
- Revisar paginas, CTAs, formularios, metadata, `mailto:` e links `wa.me` para que cada jornada use o canal correto.
- Usar o Placarsoft da cidade como fonte oficial para a competicao `Futsal 7 de Marco "Maciel da Costa da Conceicao"` quando o site exibir classificacao e jogos.
- Corrigir a tabela para respeitar a ordem oficial retornada pelo Placarsoft, incluindo dados atuais como posicao, jogos, pontos, vitorias, derrotas, gols pro/contra e forma recente.
- Adicionar verificacoes para impedir regressao na classificacao, especialmente para o Resenha FC e para a ordenacao oficial do grupo.
- Registrar fallback claro caso o Placarsoft esteja indisponivel, sem exibir dados locais como se fossem oficiais e atualizados.

## Capabilities

### New Capabilities

- `contact-routing`: Cobre os canais oficiais do Resenha, separando contato do time, contato do site, WhatsApp, e-mail, mensagens pre-preenchidas, formularios e CTAs.
- `official-competition-data`: Cobre a exibicao e sincronizacao/conferencia de classificacao e jogos com a fonte oficial externa do Placarsoft.

### Modified Capabilities

- Nenhuma capacidade existente em `openspec/specs/` sera modificada, pois ainda nao ha specs arquivadas. A mudanca introduz novas capacidades para contato e dados oficiais de competicao.

## Impact

- `apps/web/src/lib/contact.ts`: atualizar constantes e builders para suportar canais separados por finalidade.
- `apps/web/src/app/(public)/contato/page.tsx` e `apps/web/src/components/contact/ContactForm.tsx`: revisar exibicao de contatos, intencoes, validacao e destinos de WhatsApp/e-mail.
- Paginas comerciais e de apoio como `/seja-parceiro`, `/apoiar-o-resenha`, `/patrocinadores` e componentes de monetizacao: garantir que assuntos do time sejam roteados para o numero/e-mail corretos quando aplicavel.
- `apps/web/src/app/campeonatos/[slug]/page.tsx`, `apps/web/src/app/campeonatos/[slug]/CompetitionSchedulePanel.tsx` e `packages/db/src/services/football.ts`: alinhar classificacao/jogos com a fonte oficial e ajustar a apresentacao da tabela.
- `packages/db/src/schema/championships.ts`, `packages/db/src/schema/matches.ts` e migrations: possivel adicao de campos para fonte externa, identificadores Placarsoft, ultima sincronizacao e snapshots oficiais.
- `packages/db/src/services/football.test.ts` e testes novos: cobrir ordenacao oficial, fallback e mapeamento de dados externos.
- Fonte oficial pesquisada em 2026-04-21: pagina publica `https://pirangi.portal.placarsoft.com.br/campeonatos/544099817090171200/futsal-7-de-marco-maciel-da-costa-da-conceicao/classificacao-e-jogos`, discovery `https://core.b6.placarsoft.com/api/v1/placarsoft/client?host=pirangi.portal.placarsoft.com.br&portal=1`, backend `https://pirangi.b05.mandalore.esp.br/api/v1`.
- Endpoint observado para a tabela: `GET /portal/competitions/groups/19`, atualizado em `21/04/2026 17:50:13`, com Resenha FC em 7o lugar, 3 jogos, 3 pontos, 1 vitoria, 2 derrotas, 13 gols pro e 10 gols contra.
