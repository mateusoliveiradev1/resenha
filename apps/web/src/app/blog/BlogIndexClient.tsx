"use client";

import * as React from "react";
import { Container, Tabs } from "@resenha/ui";
import { PostCard, type Post } from "@/components/blog/PostCard";
import { Search } from "lucide-react";

export function BlogIndexClient({ posts }: { posts: Post[] }) {
    const [activeCategory, setActiveCategory] = React.useState("TODOS");
    const [searchQuery, setSearchQuery] = React.useState("");
    const deferredQuery = React.useDeferredValue(searchQuery);

    const categories = [
        { id: "TODOS", label: "Tudo" },
        { id: "NOTICIA", label: "Noticias" },
        { id: "RESULTADO", label: "Resultados" },
        { id: "CRONICA", label: "Cronicas" },
        { id: "BASTIDORES", label: "Bastidores" },
    ];

    const filteredPosts = React.useMemo(() => {
        const normalizedQuery = deferredQuery.trim().toLowerCase();

        return posts.filter((post) => {
            const matchesCategory = activeCategory === "TODOS" || post.category === activeCategory;

            if (!matchesCategory) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            const searchableText = [post.title, post.excerpt, post.author, post.category].join(" ").toLowerCase();
            return searchableText.includes(normalizedQuery);
        });
    }, [activeCategory, deferredQuery, posts]);

    return (
        <div className="min-h-screen bg-navy-950 pb-20">
            <div className="relative overflow-hidden border-b border-navy-800/50 bg-navy-900/30 pb-16 pt-20 md:pb-24 md:pt-32">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-navy-950 to-navy-950" />
                <div className="absolute right-1/4 top-0 h-[300px] w-[500px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

                <Container className="relative z-10 flex flex-col items-center text-center">
                    <span className="mb-6 inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-400">
                        Portal de Noticias
                    </span>
                    <h1 className="mb-6 font-display text-5xl font-black tracking-tight text-white drop-shadow-md md:text-6xl lg:text-7xl">
                        A <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Resenha</span> Oficial
                    </h1>
                    <p className="mt-2 max-w-2xl text-lg font-light leading-relaxed text-cream-300/80 md:text-xl">
                        Mantenha-se atualizado com resultados, cronicas e bastidores reais do clube.
                    </p>
                </Container>
            </div>

            <Container className="mt-8 md:mt-12">
                <div className="mb-12 flex flex-col items-center gap-6 md:flex-row md:justify-between">
                    <Tabs
                        tabs={categories}
                        activeId={activeCategory}
                        onChange={setActiveCategory}
                        variant="pills"
                        className="w-full overflow-x-auto pb-2 md:w-auto md:pb-0"
                    />

                    <div className="relative w-full md:w-72">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-navy-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Buscar resenha..."
                            className="h-11 w-full rounded-xl border border-navy-800 bg-navy-900 py-2.5 pl-10 pr-4 text-sm text-cream-100 placeholder-navy-500 shadow-inner transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>
                </div>

                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 lg:gap-8">
                        {filteredPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-navy-800 bg-navy-900/20 py-32 text-center">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-navy-800">
                            <Search className="h-6 w-6 text-navy-400" />
                        </div>
                        <h3 className="mb-2 font-display text-2xl font-bold text-cream-100">Nada encontrado</h3>
                        <p className="max-w-md text-cream-300">
                            Nao encontramos posts para esse filtro ou termo de busca.
                        </p>
                        <button
                            onClick={() => {
                                setActiveCategory("TODOS");
                                setSearchQuery("");
                            }}
                            className="mt-8 rounded-full border border-blue-500/30 px-6 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500 hover:text-white"
                        >
                            Ver tudo
                        </button>
                    </div>
                )}
            </Container>
        </div>
    );
}
