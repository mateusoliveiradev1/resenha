import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Política de Privacidade",
    description:
        "Leia a política de privacidade do Resenha RFC e entenda como o site trata dados enviados em contatos, áreas administrativas e fluxos institucionais.",
    path: "/politica-de-privacidade",
    keywords: ["política de privacidade", "dados pessoais", "privacidade", "LGPD"]
});

const sections = [
    {
        title: "Dados que podemos receber",
        paragraphs: [
            "O site do Resenha RFC pode receber dados enviados diretamente por voce em canais de contato, interesse comercial, patrocinio ou relacionamento institucional.",
            "Esses dados normalmente incluem nome, email, telefone, empresa, mensagem enviada e outros dados que voce escolha informar de forma voluntaria."
        ]
    },
    {
        title: "Como usamos essas informacoes",
        paragraphs: [
            "Os dados recebidos sao usados para responder contatos, organizar conversas comerciais, analisar pedidos de parceria, manter a operacao institucional do clube e proteger a area administrativa.",
            "Nao usamos seus dados para promessas nao descritas nesta politica e buscamos limitar o tratamento ao que for necessario para a operacao do projeto."
        ]
    },
    {
        title: "Imagens e conteudo do clube",
        paragraphs: [
            "Fotos, galerias, postagens, escudos e materiais visuais publicados no site podem ser administrados por responsaveis autorizados do clube por meio da area restrita.",
            "Quando houver envio de material por terceiros para publicacao institucional, o uso desse conteudo depende de autorizacao, contexto esportivo e interesse legitimo do projeto."
        ]
    },
    {
        title: "Compartilhamento e armazenamento",
        paragraphs: [
            "Os dados podem ser armazenados em provedores de infraestrutura, banco de dados, hospedagem e servicos tecnicos usados para manter o site e o painel funcionando.",
            "Nao vendemos dados pessoais. O compartilhamento ocorre apenas quando necessario para operacao tecnica, seguranca, atendimento ou cumprimento de obrigacoes legais."
        ]
    },
    {
        title: "Seguranca e acesso administrativo",
        paragraphs: [
            "A area administrativa do projeto e protegida por autenticacao e controles de acesso. Mesmo assim, nenhum sistema conectado a internet pode ser tratado como risco zero.",
            "Por isso adotamos boas praticas de segregacao de ambiente, variaveis sensiveis fora do codigo e revisao de acessos sempre que necessario."
        ]
    },
    {
        title: "Seus direitos e contato",
        paragraphs: [
            "Se voce quiser corrigir, atualizar ou solicitar a exclusao de dados enviados ao clube, o caminho oficial e entrar em contato pelos canais institucionais publicados no proprio site.",
            "Esta politica pode ser atualizada quando o site evoluir, especialmente se forem adicionados novos formularios, analytics, integracoes ou fluxos de relacionamento."
        ]
    }
] as const;

export default function PoliticaDePrivacidadePage() {
    return (
        <LegalDocument
            eyebrow="Documento legal"
            title="Politica de Privacidade"
            intro="Este documento explica, de forma objetiva, como o Resenha RFC trata dados recebidos pelo site institucional, pelos canais de contato e pela area administrativa."
            lastUpdated="06/04/2026"
            sections={[...sections]}
        />
    );
}
