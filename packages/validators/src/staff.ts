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

export const CreateStaffSchema = z.object({
    name: z.string().trim().min(2, "Nome muito curto"),
    role: z.string().trim().min(2, "Cargo muito curto"),
    photoUrl: optionalImageField,
    displayOrder: z.coerce.number().int().min(0).max(999).default(0),
    isActive: z.boolean().default(true),
});

export const UpdateStaffSchema = CreateStaffSchema.partial();

export type CreateStaffInput = z.infer<typeof CreateStaffSchema>;
export type UpdateStaffInput = z.infer<typeof UpdateStaffSchema>;
