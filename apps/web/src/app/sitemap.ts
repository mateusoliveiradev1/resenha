import type { MetadataRoute } from "next";
import { db } from "@resenha/db";
import { posts } from "@resenha/db/schema";
import { eq } from "drizzle-orm";
import { getAbsoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
}> = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/jogos", changeFrequency: "daily", priority: 0.95 },
    { path: "/estatisticas", changeFrequency: "daily", priority: 0.9 },
    { path: "/elenco", changeFrequency: "weekly", priority: 0.88 },
    { path: "/blog", changeFrequency: "daily", priority: 0.88 },
    { path: "/galeria", changeFrequency: "weekly", priority: 0.82 },
    { path: "/patrocinadores", changeFrequency: "weekly", priority: 0.72 },
    { path: "/historia", changeFrequency: "monthly", priority: 0.7 },
    { path: "/diretoria", changeFrequency: "monthly", priority: 0.68 },
    { path: "/titulos", changeFrequency: "monthly", priority: 0.66 },
    { path: "/contato", changeFrequency: "monthly", priority: 0.64 },
    { path: "/politica-de-privacidade", changeFrequency: "yearly", priority: 0.25 },
    { path: "/termos-de-uso", changeFrequency: "yearly", priority: 0.25 }
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    const publishedPosts = await db.query.posts.findMany({
        where: eq(posts.isPublished, true)
    });

    const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
        url: getAbsoluteUrl(route.path),
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority
    }));

    const blogEntries: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
        url: getAbsoluteUrl(`/blog/${post.slug}`),
        lastModified: post.updatedAt ?? post.publishedAt ?? post.createdAt,
        changeFrequency: "weekly",
        priority: 0.8
    }));

    return [...staticEntries, ...blogEntries];
}
