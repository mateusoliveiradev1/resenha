import { z } from "zod";

const isValidImageReference = (value: string) => {
    if (value.startsWith("/")) {
        return true;
    }

    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

const optionalImageField = z.preprocess(
    (value) => value === "" ? null : value,
    z.string().trim().refine(isValidImageReference, "Informe uma URL valida ou use o upload do sistema").optional().nullable()
);

export const CreatePostSchema = z.object({
    title: z.string().min(3),
    content: z.string().min(10),
    coverImage: optionalImageField,
    author: z.string().min(2),
    category: z.enum(["NOTICIA", "RESULTADO", "CRONICA", "BASTIDORES"]),
    matchId: z.string().uuid().optional().nullable(),
    editorialOfferingId: z.string().uuid().optional().nullable(),
    isPublished: z.boolean().default(false),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
