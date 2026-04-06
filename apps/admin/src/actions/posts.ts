"use server";

import { db } from "@resenha/db";
import { posts } from "@resenha/db/schema";
import { and, eq, not } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CreatePostSchema, type CreatePostInput, UpdatePostSchema, type UpdatePostInput } from "@resenha/validators";

function calculateExcerpt(content: string) {
    const plainText = content.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
    if (!plainText) {
        return "";
    }

    return plainText.substring(0, 150) + (plainText.length > 150 ? "..." : "");
}

function calculateReadingTime(content: string) {
    const words = content.replace(/<[^>]*>?/gm, " ").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

function generateSlug(title: string) {
    return title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

const normalizeText = (value?: string | null) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
};

async function buildUniqueSlug(title: string, ignoreId?: string) {
    const baseSlug = generateSlug(title) || "post";
    let attempt = 0;

    while (attempt < 100) {
        const nextSlug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
        const existing = await db.query.posts.findFirst({
            where: ignoreId
                ? and(eq(posts.slug, nextSlug), not(eq(posts.id, ignoreId)))
                : eq(posts.slug, nextSlug)
        });

        if (!existing || existing.id === ignoreId) {
            return nextSlug;
        }

        attempt += 1;
    }

    return `${baseSlug}-${Date.now()}`;
}

function revalidatePostPages(postId?: string, slug?: string, previousSlug?: string | null) {
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/posts");

    if (postId) {
        revalidatePath(`/posts/${postId}`);
    }

    if (slug) {
        revalidatePath(`/blog/${slug}`);
    }

    if (previousSlug && previousSlug !== slug) {
        revalidatePath(`/blog/${previousSlug}`);
    }
}

export async function createPost(data: CreatePostInput) {
    try {
        const parsed = CreatePostSchema.parse(data);
        const excerpt = calculateExcerpt(parsed.content);
        const readingTimeMin = calculateReadingTime(parsed.content);
        const slug = await buildUniqueSlug(parsed.title);
        const now = new Date();

        await db.insert(posts).values({
            title: parsed.title.trim(),
            slug,
            content: parsed.content.trim(),
            excerpt,
            coverImage: normalizeText(parsed.coverImage),
            author: parsed.author.trim(),
            readingTimeMin,
            category: parsed.category,
            matchId: parsed.matchId ?? null,
            isPublished: parsed.isPublished,
            publishedAt: parsed.isPublished ? now : null,
            updatedAt: now
        });

        revalidatePostPages(undefined, slug);
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel criar o post.") };
    }
}

export async function updatePost(id: string, data: UpdatePostInput) {
    try {
        const currentPost = await db.query.posts.findFirst({
            where: eq(posts.id, id)
        });

        if (!currentPost) {
            throw new Error("Post nao encontrado.");
        }

        const parsed = UpdatePostSchema.parse(data);
        const nextTitle = parsed.title?.trim() ?? currentPost.title;
        const nextContent = parsed.content?.trim() ?? currentPost.content;
        const nextIsPublished = parsed.isPublished ?? currentPost.isPublished;
        const nextSlug =
            parsed.title && parsed.title.trim() !== currentPost.title
                ? await buildUniqueSlug(parsed.title, id)
                : currentPost.slug;

        const nextPublishedAt =
            nextIsPublished
                ? currentPost.publishedAt ?? new Date()
                : null;

        await db.update(posts).set({
            title: nextTitle,
            slug: nextSlug,
            content: nextContent,
            excerpt: calculateExcerpt(nextContent),
            coverImage: parsed.coverImage !== undefined ? normalizeText(parsed.coverImage) : currentPost.coverImage,
            author: parsed.author?.trim() ?? currentPost.author,
            readingTimeMin: calculateReadingTime(nextContent),
            category: parsed.category ?? currentPost.category,
            matchId: parsed.matchId !== undefined ? parsed.matchId ?? null : currentPost.matchId,
            isPublished: nextIsPublished,
            publishedAt: nextPublishedAt,
            updatedAt: new Date()
        }).where(eq(posts.id, id));

        revalidatePostPages(id, nextSlug, currentPost.slug);
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel atualizar o post.") };
    }
}

export async function deletePost(id: string) {
    try {
        const currentPost = await db.query.posts.findFirst({
            where: eq(posts.id, id)
        });

        if (!currentPost) {
            throw new Error("Post nao encontrado.");
        }

        await db.delete(posts).where(eq(posts.id, id));

        revalidatePostPages(id, undefined, currentPost.slug);
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel excluir o post.") };
    }
}
