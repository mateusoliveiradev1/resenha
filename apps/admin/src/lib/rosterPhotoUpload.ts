export type RosterPhotoEntity = "players" | "staff" | "sponsors" | "posts" | "gallery" | "opponents";

interface UploadRosterPhotoResponse {
    success: boolean;
    error?: string;
    url?: string;
}

type UploadFitMode = "cover" | "inside";

interface UploadPreset {
    width: number;
    height: number;
    quality: number;
    fit: UploadFitMode;
    label: string;
    helperText: string;
    maxScale?: number;
    trimWhitespace?: boolean;
}

export const uploadPresets: Record<RosterPhotoEntity, UploadPreset> = {
    players: {
        width: 1200,
        height: 1200,
        quality: 0.86,
        fit: "cover",
        label: "1200x1200",
        helperText: "O painel ajusta automaticamente a foto para um recorte quadrado."
    },
    staff: {
        width: 1200,
        height: 1200,
        quality: 0.86,
        fit: "cover",
        label: "1200x1200",
        helperText: "A imagem e recortada automaticamente para um formato quadrado."
    },
    sponsors: {
        width: 1600,
        height: 1000,
        quality: 0.92,
        fit: "inside",
        label: "ate 1600px",
        helperText: "Logos sao aparadas automaticamente para remover bordas vazias e ganhar mais definicao visual.",
        maxScale: 2,
        trimWhitespace: true
    },
    opponents: {
        width: 1400,
        height: 1400,
        quality: 0.9,
        fit: "inside",
        label: "ate 1400px",
        helperText: "Escudos de adversarios sao aparados automaticamente para ficarem mais limpos e leves.",
        maxScale: 2,
        trimWhitespace: true
    },
    posts: {
        width: 1600,
        height: 900,
        quality: 0.88,
        fit: "cover",
        label: "1600x900",
        helperText: "Pode enviar em qualquer tamanho razoavel. O painel recorta a capa para 16:9 e comprime automaticamente."
    },
    gallery: {
        width: 1800,
        height: 1800,
        quality: 0.88,
        fit: "inside",
        label: "ate 1800px",
        helperText: "As fotos sao redimensionadas e comprimidas automaticamente para ficarem leves no site."
    }
};

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

function getProcessedFileName(originalName: string) {
    const normalizedName = originalName.replace(/\.[^.]+$/, "").trim() || "imagem";
    return `${normalizedName}.webp`;
}

function loadImageElement(file: File) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Nao foi possivel ler a imagem selecionada."));
        };

        image.src = objectUrl;
    });
}

function isBlankPixel(data: Uint8ClampedArray, index: number) {
    const alpha = data[index + 3];

    if (alpha <= 12) {
        return true;
    }

    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];

    return alpha >= 235 && red >= 245 && green >= 245 && blue >= 245;
}

function findUsefulImageBounds(context: CanvasRenderingContext2D, width: number, height: number) {
    const imageData = context.getImageData(0, 0, width, height);
    const { data } = imageData;
    const blankRatioThreshold = 0.985;

    const isBlankRow = (row: number, left: number, right: number) => {
        let blankPixels = 0;
        const totalPixels = right - left + 1;

        for (let column = left; column <= right; column += 1) {
            const pixelIndex = (row * width + column) * 4;

            if (isBlankPixel(data, pixelIndex)) {
                blankPixels += 1;
            }
        }

        return blankPixels / totalPixels >= blankRatioThreshold;
    };

    const isBlankColumn = (column: number, top: number, bottom: number) => {
        let blankPixels = 0;
        const totalPixels = bottom - top + 1;

        for (let row = top; row <= bottom; row += 1) {
            const pixelIndex = (row * width + column) * 4;

            if (isBlankPixel(data, pixelIndex)) {
                blankPixels += 1;
            }
        }

        return blankPixels / totalPixels >= blankRatioThreshold;
    };

    let top = 0;
    let bottom = height - 1;
    let left = 0;
    let right = width - 1;

    while (top < bottom && isBlankRow(top, left, right)) {
        top += 1;
    }

    while (bottom > top && isBlankRow(bottom, left, right)) {
        bottom -= 1;
    }

    while (left < right && isBlankColumn(left, top, bottom)) {
        left += 1;
    }

    while (right > left && isBlankColumn(right, top, bottom)) {
        right -= 1;
    }

    return {
        x: left,
        y: top,
        width: right - left + 1,
        height: bottom - top + 1
    };
}

async function canvasToFile(canvas: HTMLCanvasElement, fileName: string, quality: number) {
    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((value) => resolve(value), "image/webp", quality);
    });

    if (!blob) {
        throw new Error("Nao foi possivel preparar a imagem para upload.");
    }

    return new File([blob], fileName, {
        type: "image/webp",
        lastModified: Date.now()
    });
}

async function prepareImageForUpload(file: File, entity: RosterPhotoEntity) {
    if (!isBrowser || !file.type.startsWith("image/")) {
        return file;
    }

    const preset = uploadPresets[entity];
    const image = await loadImageElement(file);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Nao foi possivel inicializar o editor de imagem do navegador.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    if (preset.fit === "cover") {
        canvas.width = preset.width;
        canvas.height = preset.height;

        const scale = Math.max(preset.width / image.naturalWidth, preset.height / image.naturalHeight);
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        const offsetX = (preset.width - drawWidth) / 2;
        const offsetY = (preset.height - drawHeight) / 2;

        context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    } else {
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = image.naturalWidth;
        let sourceHeight = image.naturalHeight;

        if (preset.trimWhitespace) {
            const stagingCanvas = document.createElement("canvas");
            const stagingContext = stagingCanvas.getContext("2d");

            if (!stagingContext) {
                throw new Error("Nao foi possivel preparar a logo para upload.");
            }

            stagingCanvas.width = image.naturalWidth;
            stagingCanvas.height = image.naturalHeight;
            stagingContext.drawImage(image, 0, 0);

            const bounds = findUsefulImageBounds(stagingContext, stagingCanvas.width, stagingCanvas.height);

            sourceX = bounds.x;
            sourceY = bounds.y;
            sourceWidth = bounds.width;
            sourceHeight = bounds.height;
        }

        const paddingX = preset.trimWhitespace ? Math.max(20, Math.round(sourceWidth * 0.06)) : 0;
        const paddingY = preset.trimWhitespace ? Math.max(20, Math.round(sourceHeight * 0.08)) : 0;
        const outputWidth = sourceWidth + paddingX * 2;
        const outputHeight = sourceHeight + paddingY * 2;
        const scale = Math.min(
            preset.width / outputWidth,
            preset.height / outputHeight,
            preset.maxScale ?? 1
        );

        canvas.width = Math.max(1, Math.round(outputWidth * scale));
        canvas.height = Math.max(1, Math.round(outputHeight * scale));

        const drawX = paddingX * scale;
        const drawY = paddingY * scale;
        const drawWidth = sourceWidth * scale;
        const drawHeight = sourceHeight * scale;

        context.drawImage(
            image,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            drawX,
            drawY,
            drawWidth,
            drawHeight
        );
    }

    return canvasToFile(canvas, getProcessedFileName(file.name), preset.quality);
}

export async function uploadRosterPhoto(file: File, entity: RosterPhotoEntity = "players") {
    const processedFile = await prepareImageForUpload(file, entity);
    const formData = new FormData();
    formData.append("file", processedFile, processedFile.name);
    formData.append("entity", entity);

    const response = await fetch("/api/uploads/roster-photo", {
        method: "POST",
        body: formData
    });

    const payload = await response.json() as UploadRosterPhotoResponse;

    if (!response.ok || !payload.success || !payload.url) {
        throw new Error(payload.error ?? "Nao foi possivel enviar a foto.");
    }

    return payload.url;
}
