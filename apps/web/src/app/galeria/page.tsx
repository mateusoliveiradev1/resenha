import { db } from "@resenha/db";
import { gallery } from "@resenha/db/schema";
import { desc } from "drizzle-orm";
import { GalleryClient } from "./GalleryClient";
import type { Photo } from "@/components/galeria/LightboxModal";

export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
    const photos = await db.select().from(gallery).orderBy(desc(gallery.uploadedAt));

    const mappedPhotos: Photo[] = photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        caption: photo.caption
    }));

    return <GalleryClient photos={mappedPhotos} />;
}
