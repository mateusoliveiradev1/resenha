import { LegalDocument } from "@/components/legal/LegalDocument";

const sections = [
    {
        title: "Objeto do site",
        paragraphs: [
            "O site do Resenha RFC existe para apresentar o clube, publicar conteudo institucional, mostrar elenco, estatisticas, jogos, galeria, patrocinadores e canais de relacionamento.",
            "Algumas areas podem ser apenas informativas e outras podem evoluir ao longo do tempo conforme o projeto crescer."
        ]
    },
    {
        title: "Uso adequado da plataforma",
        paragraphs: [
            "Ao navegar pelo site, voce concorda em nao praticar abuso de acesso, tentativa de invasao, raspagem agressiva, fraude, uso indevido da marca ou qualquer acao que prejudique a operacao do projeto.",
            "Tambem nao e permitido tentar acessar a area restrita sem autorizacao formal do clube."
        ]
    },
    {
        title: "Conteudo institucional e visual",
        paragraphs: [
            "Textos, identidade visual, fotos publicadas, escudos, materiais de campanha e narrativas institucionais do site fazem parte do acervo do projeto ou sao usados com a autorizacao adequada.",
            "O uso, copia ou redistribuicao desse material deve respeitar contexto, credito e finalidade legitima."
        ]
    },
    {
        title: "Patrocinadores e parceiros",
        paragraphs: [
            "Marcas exibidas no site podem aparecer em areas como home, pagina de patrocinadores, postagens e materiais institucionais do clube.",
            "A exibicao de parceiros depende de cadastro, aprovacao e manutencao ativa no painel administrativo."
        ]
    },
    {
        title: "Disponibilidade e evolucao",
        paragraphs: [
            "O Resenha RFC pode atualizar layout, funcionalidades, conteudo e estrutura tecnica do site a qualquer momento, inclusive para manutencao, seguranca ou melhoria de experiencia.",
            "A existencia de uma pagina publica nao significa obrigacao de disponibilidade permanente ou de continuidade no formato atual."
        ]
    },
    {
        title: "Contato e duvidas",
        paragraphs: [
            "Se houver duvida sobre uso do site, publicacao de conteudo, parcerias ou exercicio de direitos relacionados a dados, o contato deve ser feito pelos canais institucionais do clube.",
            "Ao continuar utilizando o site, voce concorda com estes termos no estado atual da plataforma."
        ]
    }
] as const;

export default function TermosDeUsoPage() {
    return (
        <LegalDocument
            eyebrow="Documento legal"
            title="Termos de Uso"
            intro="Estes termos definem as regras gerais de uso do site institucional do Resenha RFC, incluindo navegacao publica, conteudo institucional e acesso a areas protegidas."
            lastUpdated="06/04/2026"
            sections={[...sections]}
        />
    );
}
