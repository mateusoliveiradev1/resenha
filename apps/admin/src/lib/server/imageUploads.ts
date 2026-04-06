import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_UPLOAD_SIZE_BYTES = 3 * 1024 * 1024;
const UPLOADS_ROOT = path.resolve(/* turbopackIgnore: true */ process.cwd(), "../../storage/uploads");

const uploadTargets = {
    opponents: { directory: "opponents", prefix: "opponent" },
    players: { directory: "players", prefix: "player" },
    staff: { directory: "staff", prefix: "staff" },
    sponsors: { directory: "sponsors", prefix: "sponsor" },
    posts: { directory: "posts", prefix: "post" },
    gallery: { directory: "gallery", prefix: "gallery" }
} as const;

export type UploadImageTarget = keyof typeof uploadTargets;

export const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
};

function detectImageType(buffer: Buffer) {
    if (
        buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
    ) {
        return { extension: "png", contentType: "image/png" };
    }

    if (
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
    ) {
        return { extension: "jpg", contentType: "image/jpeg" };
    }

    if (
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
        buffer.subarray(8, 12).toString("ascii") === "WEBP"
    ) {
        return { extension: "webp", contentType: "image/webp" };
    }

    return null;
}

export async function saveUploadedImage(file: File, target: UploadImageTarget) {
    if (!(file instanceof File)) {
        throw new Error("Nenhum arquivo foi enviado.");
    }

    if (file.size <= 0) {
        throw new Error("O arquivo enviado esta vazio.");
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        throw new Error("A imagem precisa ter no maximo 3 MB.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedType = detectImageType(buffer);

    if (!detectedType) {
        throw new Error("Formato invalido. Use PNG, JPG ou WEBP.");
    }

    const targetConfig = uploadTargets[target];
    const targetDirectory = path.join(UPLOADS_ROOT, targetConfig.directory);

    await mkdir(targetDirectory, { recursive: true });

    const contentHash = createHash("sha256").update(buffer).digest("hex").slice(0, 24);
    const fileName = `${targetConfig.prefix}-${contentHash}.${detectedType.extension}`;
    const targetPath = path.join(targetDirectory, fileName);

    await writeFile(targetPath, buffer);

    return {
        url: `/uploads/${targetConfig.directory}/${fileName}`,
        contentType: detectedType.contentType
    };
}
