import * as React from "react";
import { Container, Card, Badge, shouldBypassNextImageOptimization } from "@resenha/ui";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

export interface PostPreview {
    slug: string;
    title: string;
    excerpt: string;
    category: "NOTICIA" | "RESULTADO" | "CRONICA" | "BASTIDORES";
    publishedAt: Date;
    readingTimeMin: number;
    coverImage?: string | null;
}

export function LatestPosts({ posts }: { posts?: PostPreview[] }) {
    if (!posts || !posts.length) return null;

    return (
        <section className="bg-navy-950/50 py-16">
            <Container>
                <div className="mb-8 flex items-end justify-between border-b border-navy-800 pb-4">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-cream-100">Últimas Notícias</h2>
                        <p className="mt-1 text-sm text-cream-300">Fique por dentro das novidades do Resenha.</p>
                    </div>
                    <Link href="/blog" className="hidden text-sm font-semibold text-blue-400 transition-colors hover:text-blue-300 sm:block">
                        Acessar Blog →
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {posts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`}>
                            <Card className="flex h-full cursor-pointer flex-col overflow-hidden bg-navy-900/60 transition-all hover:border-navy-700 hover:bg-navy-900 sm:flex-row">
                                <div className="relative h-48 shrink-0 bg-navy-800 sm:h-auto sm:w-1/3">
                                    {post.coverImage ? (
                                        <Image
                                            src={post.coverImage}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            unoptimized={shouldBypassNextImageOptimization(post.coverImage)}
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-navy-800 to-navy-900 p-4 transition-transform duration-500 group-hover:scale-105">
                                            <Image src="/logo2.png" alt="Resenha" width={80} height={80} className="object-contain opacity-30" />
                                        </div>
                                    )}
                                    <Badge variant={post.category === "RESULTADO" ? "success" : "accent"} className="absolute left-4 top-4 z-10">
                                        {post.category}
                                    </Badge>
                                </div>

                                <div className="flex flex-1 flex-col p-6">
                                    <h3 className="line-clamp-2 font-display text-lg font-bold text-cream-100 transition-colors group-hover:text-blue-400">
                                        {post.title}
                                    </h3>
                                    <p className="mb-4 mt-2 line-clamp-2 flex-1 text-sm text-cream-300">{post.excerpt}</p>

                                    <div className="mt-auto flex items-center border-t border-navy-800/50 pt-4 text-xs font-medium text-navy-700">
                                        <span className="text-cream-300">
                                            {post.publishedAt.toLocaleDateString("pt-BR", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </span>
                                        <span className="mx-2">•</span>
                                        <span className="flex items-center text-cream-300">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {post.readingTimeMin} min
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 text-center sm:hidden">
                    <Link
                        href="/blog"
                        className="block w-full rounded-lg border border-navy-800 p-4 text-sm font-semibold text-blue-400 transition-colors hover:text-blue-300"
                    >
                        Ver Todas Notícias
                    </Link>
                </div>
            </Container>
        </section>
    );
}
