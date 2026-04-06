import type { Metadata } from "next";
import { db } from "@resenha/db";
import { gallery } from "@resenha/db/schema";
import { desc } from "drizzle-orm";
import { GalleryClient } from "./GalleryClient";
import type { Photo } from "@/components/galeria/LightboxModal";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
    title: "Galeria",
    description:
        "Explore a galeria do Resenha RFC com fotos de jogos, bastidores e momentos reais do clube dentro e fora de jogo.",
    path: "/galeria",
    keywords: ["galeria", "fotos", "jogos", "bastidores", "momentos do clube"]
});

export default async function GaleriaPage() {
    const photos = await db.select().from(gallery).orderBy(desc(gallery.uploadedAt));

    const mappedPhotos: Photo[] = photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        caption: photo.caption
    }));

    return <GalleryClient photos={mappedPhotos} />;
}
