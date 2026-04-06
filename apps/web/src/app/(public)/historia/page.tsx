import { Container } from "@resenha/ui";

export default function NossaHistoriaPage() {
    return (
        <div className="min-h-[60vh] bg-navy-950 py-20">
            <Container>
                <div className="max-w-3xl">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl">
                        Nossa História
                    </h1>
                    <p className="mt-6 text-lg leading-relaxed text-cream-300">
                        O Resenha RFC nasceu da paixão pelo futebol amador. Mais do que um time, somos uma família unida pela vontade de vencer e pela amizade dentro e fora de campo. Desde a nossa fundação, temos orgulho de honrar nossa camisa com garra e dedicação.
                    </p>
                </div>
            </Container>
        </div>
    );
}
