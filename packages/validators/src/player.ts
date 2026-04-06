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

const nullableNumberField = (min: number, max: number) =>
    z.preprocess(
        (value) => value === "" || value == null || Number.isNaN(value) ? null : value,
        z.number().int().min(min).max(max).optional().nullable()
    );

const optionalTextField = z.preprocess(
    (value) => value === "" ? null : value,
    z.string().trim().optional().nullable()
);

const optionalBirthDateField = z.preprocess(
    (value) => value === "" ? null : value,
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD exigido").optional().nullable()
);

const optionalImageField = z.preprocess(
    (value) => value === "" ? null : value,
    z.string().trim().refine(isValidImageReference, "Informe uma URL valida ou use o upload do sistema").optional().nullable()
);

export const CreatePlayerSchema = z.object({
    name: z.string().trim().min(2, "Nome e muito curto"),
    nickname: z.string().trim().min(2, "Apelido e obrigatorio"),
    position: z.enum(["GOL", "DEF", "MEI", "ATA"]),
    shirtNumber: z.number().int().min(1).max(99),
    photoUrl: optionalImageField,
    bio: optionalTextField,
    heightCm: nullableNumberField(100, 250),
    weightKg: nullableNumberField(30, 150),
    birthDate: optionalBirthDateField,
    preferredFoot: z.enum(["DIREITO", "ESQUERDO", "AMBIDESTRO"]).optional().nullable(),
    goals: z.coerce.number().int().min(0).default(0),
    assists: z.coerce.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
});

export const UpdatePlayerSchema = CreatePlayerSchema.partial();

export const PlayerFilterSchema = z.object({
    position: z.enum(["GOL", "DEF", "MEI", "ATA"]).optional(),
    active: z.boolean().optional(),
});

export type CreatePlayerInput = z.infer<typeof CreatePlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof UpdatePlayerSchema>;
