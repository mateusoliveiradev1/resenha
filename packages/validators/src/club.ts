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

const optionalTextField = z.preprocess(
    (value) => value === "" ? null : value,
    z.string().trim().optional().nullable()
);

const optionalImageField = z.preprocess(
    (value) => value === "" ? null : value,
    z.string().trim().refine(isValidImageReference, "Informe uma URL valida ou use o upload do sistema").optional().nullable()
);

export const CreateClubSchema = z.object({
    name: z.string().trim().min(2, "Nome do clube e obrigatorio"),
    shortName: z.string().trim().min(2, "Nome curto e obrigatorio").max(18, "Use ate 18 caracteres"),
    slug: optionalTextField,
    logoUrl: optionalImageField,
    city: optionalTextField,
    isResenha: z.boolean().default(false),
    isActive: z.boolean().default(true),
});

export const UpdateClubSchema = CreateClubSchema.partial();

export type CreateClubInput = z.infer<typeof CreateClubSchema>;
export type UpdateClubInput = z.infer<typeof UpdateClubSchema>;
