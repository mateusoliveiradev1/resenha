import * as React from "react";
import { Card, Badge, shouldBypassNextImageOptimization, type BadgeProps } from "@resenha/ui";
import Image from "next/image";
import Link from "next/link";
import { Clock, Calendar, ArrowRight } from "lucide-react";

export interface Post {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category: "NOTICIA" | "RESULTADO" | "CRONICA" | "BASTIDORES";
    publishedAt: Date;
    readingTimeMin: number;
    coverImage?: string | null;
    author: string;
}

export function PostCard({ post }: { post: Post }) {
    const getCategoryLabel = (category: Post["category"]) => {
        switch (category) {
            case "NOTICIA": return "Noticias";
            case "RESULTADO": return "Resultado";
            case "CRONICA": return "Cronica";
            case "BASTIDORES": return "Bastidores";
            default: return "Noticias";
        }
    };

    const getCategoryColor = (category: Post["category"]): NonNullable<BadgeProps["variant"]> => {
        switch (category) {
            case "NOTICIA": return "default";
            case "RESULTADO": return "success";
            case "CRONICA": return "accent";
            case "BASTIDORES": return "warning";
            default: return "default";
        }
    };

    return (
        <Link href={`/blog/${post.slug}`} className="block h-full outline-none">
            <Card className="h-full overflow-hidden group hover:-translate-y-1 transition-all duration-300 border-navy-800 bg-navy-950/50 cursor-pointer flex flex-col rounded-2xl hover:shadow-[0_10px_40px_rgba(59,130,246,0.1)] hover:border-blue-500/30">
                {/* Cover Image Area */}
                <div className="relative h-48 sm:h-56 w-full bg-navy-900 overflow-hidden shrink-0 border-b border-navy-800/50">
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent z-10 opacity-60" />

                    {post.coverImage ? (
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            unoptimized={shouldBypassNextImageOptimization(post.coverImage)}
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-navy-800 to-navy-900 transition-transform duration-700 group-hover:scale-105">
                            <Image src="/logo2.png" alt="Resenha" width={100} height={100} className="object-contain opacity-10 drop-shadow-lg" />
                        </div>
                    )}

                    <div className="absolute top-4 left-4 z-20">
                        <Badge variant={getCategoryColor(post.category)} className="shadow-lg backdrop-blur-md bg-opacity-90 px-3 py-1 text-[10px] tracking-widest uppercase font-bold ring-1 ring-white/10">
                            {getCategoryLabel(post.category)}
                        </Badge>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 sm:p-8 flex flex-col flex-1 relative bg-navy-900/40">
                    {/* Hover Glow Effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/50 transition-all duration-500" />

                    <div className="flex items-center gap-3 text-[11px] font-semibold text-navy-400 uppercase tracking-widest mb-4">
                        <span className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-80 text-blue-400" />
                            {post.publishedAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }).replace(" de ", " ")}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-navy-700" />
                        <span className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1.5 opacity-80 text-gold-400" />
                            {post.readingTimeMin} MIN
                        </span>
                    </div>

                    <h3 className="font-display text-xl sm:text-2xl font-bold text-cream-100 group-hover:text-blue-400 transition-colors line-clamp-3 leading-snug mb-4 drop-shadow-sm">
                        {post.title}
                    </h3>

                    <p className="text-sm text-cream-300/80 line-clamp-3 mb-6 flex-1 font-light leading-relaxed">
                        {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-navy-800/80">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
                            Por <span className="text-cream-100">{post.author}</span>
                        </span>

                        <div className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
