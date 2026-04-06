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
        <section className="py-16 bg-navy-950/50">
            <Container>
                <div className="flex items-end justify-between border-b border-navy-800 pb-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-cream-100">Últimas Notícias</h2>
                        <p className="text-sm text-cream-300 mt-1">Fique por dentro das novidades do Resenha.</p>
                    </div>
                    <a href="/blog" className="text-sm font-semibold text-blue-400 hover:text-blue-300 hidden sm:block transition-colors">
                        Acessar Blog →
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`}>
                            <Card className="flex flex-col sm:flex-row overflow-hidden group hover:border-navy-700 transition-all h-full bg-navy-900/60 hover:bg-navy-900 cursor-pointer">
                                {/* Image Placeholder */}
                                <div className="sm:w-1/3 h-48 sm:h-auto bg-navy-800 relative shrink-0">
                                    {post.coverImage ? (
                                        <Image
                                            src={post.coverImage}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            unoptimized={shouldBypassNextImageOptimization(post.coverImage)}
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-navy-800 to-navy-900 group-hover:scale-105 transition-transform duration-500">
                                            <Image src="/logo2.png" alt="Resenha" width={80} height={80} className="object-contain opacity-30" />
                                        </div>
                                    )}
                                    <Badge variant={post.category === "RESULTADO" ? "success" : "accent"} className="absolute top-4 left-4 z-10">
                                        {post.category}
                                    </Badge>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="font-display font-bold text-lg text-cream-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-cream-300 line-clamp-2 mb-4 flex-1">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center text-xs text-navy-700 font-medium pt-4 border-t border-navy-800/50 mt-auto">
                                        <span className="text-cream-300">
                                            {post.publishedAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                                        </span>
                                        <span className="mx-2">•</span>
                                        <span className="flex items-center text-cream-300">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {post.readingTimeMin} min
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 text-center sm:hidden">
                    <a href="/blog" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors w-full p-4 block border border-navy-800 rounded-lg">
                        Ver Todas Notícias
                    </a>
                </div>
            </Container>
        </section>
    );
}
