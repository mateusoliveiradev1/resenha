import { Container } from "@resenha/ui";

export default function TitulosPage() {
    return (
        <div className="py-20 min-h-[60vh] bg-navy-950">
            <Container>
                <div className="max-w-3xl">
                    <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-cream-100 mb-6">
                        Nossos Títulos
                    </h1>
                    <p className="text-lg leading-relaxed text-cream-300">
                        O Resenha RFC está construindo seu legado. Acompanhe nossas conquistas e a sala de troféus que cresce a cada temporada.
                    </p>
                    <div className="mt-12 text-center py-16 border border-dashed border-navy-800 rounded-xl bg-navy-900/50">
                        <p className="text-cream-400">Página em construção. Em breve nossa galeria de troféus!</p>
                    </div>
                </div>
            </Container>
        </div>
    );
}
