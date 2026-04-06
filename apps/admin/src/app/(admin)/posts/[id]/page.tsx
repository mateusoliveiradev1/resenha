import * as React from "react";
import { notFound } from "next/navigation";
import { db } from "@resenha/db";
import { posts } from "@resenha/db/schema";
import { eq } from "drizzle-orm";
import { EditarPostForm } from "./EditarPostForm";

export default async function EditarPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch real post data
    const postData = await db.query.posts.findFirst({
        where: eq(posts.id, id),
    });

    if (!postData) {
        notFound();
    }

    return <EditarPostForm post={postData} />;
}
