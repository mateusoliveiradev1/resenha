import { NextResponse } from "next/server";
import { getErrorMessage, saveUploadedImage } from "@/lib/server/imageUploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const uploadedFile = formData.get("file");
        const savedImage = await saveUploadedImage(uploadedFile as File, "opponents");

        return NextResponse.json({
            success: true,
            url: savedImage.url,
            contentType: savedImage.contentType
        });
    } catch (error: unknown) {
        const message = getErrorMessage(error, "Falha ao enviar a imagem do adversario.");
        const status =
            message.includes("Formato invalido") || message.includes("3 MB") || message.includes("arquivo")
                ? 400
                : 500;

        return NextResponse.json({ success: false, error: message }, { status });
    }
}
