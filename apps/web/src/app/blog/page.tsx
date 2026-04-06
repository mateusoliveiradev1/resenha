import type { Metadata } from "next";
import { db } from "@resenha/db";
import { posts } from "@resenha/db/schema";
import { desc, eq } from "drizzle-orm";
import { BlogIndexClient } from "./BlogIndexClient";
import type { Post } from "@/components/blog/PostCard";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
    title: "Blog",
    description:
        "Leia notícias, resultados, crônicas e bastidores do Resenha RFC no blog oficial do clube.",
    path: "/blog",
    keywords: ["blog", "notícias", "resultados", "crônicas", "bastidores"]
});

export default async function BlogPage() {
    const publishedPosts = await db.query.posts.findMany({
        where: eq(posts.isPublished, true),
        orderBy: [desc(posts.publishedAt), desc(posts.createdAt)]
    });

    const mappedPosts: Post[] = publishedPosts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        publishedAt: post.publishedAt ?? post.createdAt,
        readingTimeMin: post.readingTimeMin,
        coverImage: post.coverImage,
        author: post.author
    }));

    return <BlogIndexClient posts={mappedPosts} />;
}
