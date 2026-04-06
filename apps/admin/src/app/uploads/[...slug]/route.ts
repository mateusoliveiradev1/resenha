import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const UPLOADS_ROOT = path.resolve(/* turbopackIgnore: true */ process.cwd(), "../../storage/uploads");

export const runtime = "nodejs";

function getContentType(filePath: string) {
    if (filePath.endsWith(".png")) return "image/png";
    if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
    if (filePath.endsWith(".webp")) return "image/webp";
    return "application/octet-stream";
}

function resolveSafePath(slug: string[]) {
    const resolvedPath = path.resolve(UPLOADS_ROOT, ...slug);

    if (!resolvedPath.startsWith(UPLOADS_ROOT)) {
        return null;
    }

    return resolvedPath;
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;

    if (!slug || slug.length === 0) {
        return new NextResponse("Not found", { status: 404 });
    }

    const filePath = resolveSafePath(slug);

    if (!filePath) {
        return new NextResponse("Invalid path", { status: 400 });
    }

    try {
        const fileBuffer = await readFile(filePath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": getContentType(filePath),
                "Cache-Control": "public, max-age=31536000, immutable"
            }
        });
    } catch {
        return new NextResponse("Not found", { status: 404 });
    }
}
