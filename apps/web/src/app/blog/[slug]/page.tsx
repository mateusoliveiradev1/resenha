import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@resenha/db";
import { posts } from "@resenha/db/schema";
import { Badge, Button, Container } from "@resenha/ui";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

export const dynamic = "force-dynamic";

const categoryVariantMap = {
    NOTICIA: "default",
    RESULTADO: "success",
    CRONICA: "accent",
    BASTIDORES: "warning"
} as const;

const categoryLabelMap = {
    NOTICIA: "Noticia",
    RESULTADO: "Resultado",
    CRONICA: "Cronica",
    BASTIDORES: "Bastidores"
} as const;

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const post = await db.query.posts.findFirst({
        where: and(eq(posts.slug, slug), eq(posts.isPublished, true)),
        with: {
            match: true
        }
    });

    if (!post) {
        notFound();
    }

    const publishDate = post.publishedAt ?? post.createdAt;
    const hasHtmlContent = /<\/?[a-z][\s\S]*>/i.test(post.content);

    return (
        <article className="min-h-screen pb-20">
            <div className="relative overflow-hidden border-b border-navy-800 bg-navy-950 pb-20 pt-32 lg:pb-28 lg:pt-40">
                <div className="absolute inset-0 z-0 opacity-20 bg-gradient-to-br from-blue-900/30 to-navy-950">
                    <div className="absolute inset-0 backdrop-blur-3xl" />
                </div>

                {post.coverImage && (
                    <div className="absolute inset-0 opacity-20">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            sizes="100vw"
                            unoptimized={post.coverImage.startsWith("/uploads/")}
                            className="object-cover"
                        />
                    </div>
                )}

                <Container className="relative z-10">
                    <div className="mb-8">
                        <Link href="/blog" className="inline-flex items-center text-sm font-medium text-blue-400 transition-colors hover:text-blue-300">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para o blog
                        </Link>
                    </div>

                    <div className="max-w-3xl">
                        <Badge variant={categoryVariantMap[post.category]} className="mb-6 font-bold">
                            {categoryLabelMap[post.category]}
                        </Badge>

                        <h1 className="mb-6 font-display text-4xl font-extrabold leading-tight text-cream-100 lg:text-5xl xl:text-6xl">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-cream-300">
                            <div className="flex items-center">
                                <User className="mr-2 h-4 w-4 text-navy-400" />
                                <span className="font-medium">{post.author}</span>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-navy-400" />
                                <time dateTime={publishDate.toISOString()}>
                                    {publishDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                                </time>
                            </div>
                            <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4 text-navy-400" />
                                <span>{post.readingTimeMin} min de leitura</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="mt-12 lg:mt-16">
                <div className="mx-auto max-w-4xl">
                    <div className="overflow-hidden rounded-[32px] border border-navy-800 bg-[linear-gradient(180deg,rgba(15,31,56,0.96),rgba(6,14,26,0.98))] shadow-[0_32px_80px_rgba(0,0,0,0.28)]">
                        <div className="grid gap-8 border-b border-navy-800/80 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:p-10">
                            <div>
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.38em] text-blue-300">
                                    Diario Oficial do Resenha
                                </p>
                                <p className="mt-4 max-w-2xl text-lg leading-8 text-cream-100 sm:text-xl">
                                    {post.excerpt}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-blue-500/15 bg-navy-950/65 p-5">
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-cream-300/70">
                                    Ficha editorial
                                </p>
                                <div className="mt-4 space-y-4 text-sm text-cream-300">
                                    <div>
                                        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-cream-300/55">Categoria</p>
                                        <p className="mt-1 font-medium text-cream-100">{categoryLabelMap[post.category]}</p>
                                    </div>
                                    <div>
                                        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-cream-300/55">Assinatura</p>
                                        <p className="mt-1 font-medium text-cream-100">{post.author}</p>
                                    </div>
                                    <div>
                                        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-cream-300/55">Leitura</p>
                                        <p className="mt-1 font-medium text-cream-100">{post.readingTimeMin} min</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 lg:p-12">
                            <div className="article-rich">
                                {hasHtmlContent ? (
                                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                                ) : (
                                    post.content.split(/\n{2,}/).map((paragraph, index) => (
                                        <p key={`${post.id}-${index}`}>{paragraph.trim()}</p>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {post.match && (
                    <div className="mx-auto mt-16 max-w-4xl border-t border-navy-800 pt-8">
                        <h3 className="mb-6 font-display text-xl font-bold text-cream-100">Partida relacionada</h3>
                        <div className="flex flex-col items-center justify-between gap-6 rounded-xl border border-navy-800 bg-navy-900 p-6 sm:flex-row">
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <span className="block font-display text-2xl font-bold text-cream-100">
                                        {post.match.scoreHome ?? "-"}
                                    </span>
                                    <span className="mt-1 text-xs uppercase tracking-widest text-cream-300">Resenha</span>
                                </div>
                                <span className="px-2 font-bold text-navy-500">X</span>
                                <div className="text-center">
                                    <span className="block font-display text-2xl font-bold text-cream-100">
                                        {post.match.scoreAway ?? "-"}
                                    </span>
                                    <span className="mt-1 text-xs uppercase tracking-widest text-cream-300">{post.match.opponent}</span>
                                </div>
                            </div>

                            <Button variant="outline" asChild>
                                <Link href="/jogos">Ver jogos</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </Container>
        </article>
    );
}
