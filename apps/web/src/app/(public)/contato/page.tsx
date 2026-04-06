import { Container } from "@resenha/ui";

export default function ContatoPage() {
    return (
        <div className="py-20 min-h-[60vh] bg-navy-950">
            <Container>
                <div className="max-w-3xl mx-auto">
                    <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-cream-100 mb-6 text-center">
                        Fale Conosco
                    </h1>
                    <p className="text-lg leading-relaxed text-cream-300 text-center mb-12">
                        Seja para desafios, parcerias ou entrar pro clube oficial de sócios. Mande sua mensagem!
                    </p>

                    <form className="bg-navy-900 border border-navy-800 p-8 rounded-xl space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-cream-300">Nome</label>
                                <input type="text" className="w-full bg-navy-950 border border-navy-700 rounded-md px-4 py-2 text-cream-100 focus:outline-none focus:border-blue-500" placeholder="Seu nome" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-cream-300">Email</label>
                                <input type="email" className="w-full bg-navy-950 border border-navy-700 rounded-md px-4 py-2 text-cream-100 focus:outline-none focus:border-blue-500" placeholder="seu@email.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-cream-300">Assunto</label>
                            <input type="text" className="w-full bg-navy-950 border border-navy-700 rounded-md px-4 py-2 text-cream-100 focus:outline-none focus:border-blue-500" placeholder="Ex: Marcar Amistoso" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-cream-300">Mensagem</label>
                            <textarea rows={4} className="w-full bg-navy-950 border border-navy-700 rounded-md px-4 py-2 text-cream-100 focus:outline-none focus:border-blue-500" placeholder="Como podemos ajudar?" />
                        </div>
                        <button type="button" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
                            Enviar Mensagem
                        </button>
                    </form>
                </div>
            </Container>
        </div>
    );
}
