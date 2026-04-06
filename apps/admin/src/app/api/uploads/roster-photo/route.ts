import { NextResponse } from "next/server";
import { getErrorMessage, saveUploadedImage, type UploadImageTarget } from "@/lib/server/imageUploads";

const rosterTargets = new Set<UploadImageTarget>(["players", "staff", "sponsors", "posts", "gallery", "opponents"]);

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const uploadedFile = formData.get("file");
        const entityValue = formData.get("entity");

        const entity =
            typeof entityValue === "string" && rosterTargets.has(entityValue as UploadImageTarget)
                ? (entityValue as UploadImageTarget)
                : "players";

        const savedImage = await saveUploadedImage(uploadedFile as File, entity);

        return NextResponse.json({
            success: true,
            url: savedImage.url,
            contentType: savedImage.contentType
        });
    } catch (error: unknown) {
        const message = getErrorMessage(error, "Falha ao enviar a foto.");
        const status =
            message.includes("Formato invalido") || message.includes("3 MB") || message.includes("arquivo")
                ? 400
                : 500;

        return NextResponse.json({ success: false, error: message }, { status });
    }
}
