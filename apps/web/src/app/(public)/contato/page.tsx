import { Container } from "@resenha/ui";

export default function ContatoPage() {
    return (
        <div className="min-h-[60vh] bg-navy-950 py-20">
            <Container>
                <div className="mx-auto max-w-3xl">
                    <h1 className="mb-6 text-center font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl">
                        Fale Conosco
                    </h1>
                    <p className="mb-12 text-center text-lg leading-relaxed text-cream-300">
                        Seja para desafios, parcerias ou entrar para o clube oficial de sócios. Mande sua mensagem!
                    </p>

                    <form className="space-y-6 rounded-xl border border-navy-800 bg-navy-900 p-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-cream-300">Nome</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-navy-700 bg-navy-950 px-4 py-2 text-cream-100 focus:border-blue-500 focus:outline-none"
                                    placeholder="Seu nome"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-cream-300">Email</label>
                                <input
                                    type="email"
                                    className="w-full rounded-md border border-navy-700 bg-navy-950 px-4 py-2 text-cream-100 focus:border-blue-500 focus:outline-none"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-cream-300">Assunto</label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-navy-700 bg-navy-950 px-4 py-2 text-cream-100 focus:border-blue-500 focus:outline-none"
                                placeholder="Ex: Marcar amistoso"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-cream-300">Mensagem</label>
                            <textarea
                                rows={4}
                                className="w-full rounded-md border border-navy-700 bg-navy-950 px-4 py-2 text-cream-100 focus:border-blue-500 focus:outline-none"
                                placeholder="Como podemos ajudar?"
                            />
                        </div>
                        <button
                            type="button"
                            className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-700"
                        >
                            Enviar Mensagem
                        </button>
                    </form>
                </div>
            </Container>
        </div>
    );
}
