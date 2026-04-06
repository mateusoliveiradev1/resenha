import { z } from "zod";

const isValidMatchDate = (value: string) => !Number.isNaN(new Date(value).getTime());

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

const nullableNumberField = z.preprocess(
    (value) => value === "" || value == null || Number.isNaN(value) ? null : value,
    z.number().int().min(0).optional().nullable(),
);

export const CreateMatchSchema = z.object({
    date: z.string().min(1, "Data e hora da partida sao obrigatorias").refine(isValidMatchDate, "Data e hora invalidas"),
    opponent: z.string().trim().min(2, "Nome do adversario e obrigatorio"),
    opponentLogo: z.string().trim().refine(isValidImageReference, "Informe uma URL valida ou use o upload do sistema").optional().nullable(),
    type: z.enum(["FUTSAL", "CAMPO"]),
    location: z.string().trim().min(2, "Local da partida e obrigatorio"),
    scoreHome: nullableNumberField,
    scoreAway: nullableNumberField,
    status: z.enum(["SCHEDULED", "LIVE", "FINISHED"]).default("SCHEDULED"),
    season: z.string().trim().min(2, "Campeonato ou torneio e obrigatorio"),
    summary: z.string().optional().nullable(),
});

export const UpdateMatchSchema = CreateMatchSchema.partial();

export const MatchFilterSchema = z.object({
    type: z.enum(["FUTSAL", "CAMPO"]).optional(),
    status: z.enum(["SCHEDULED", "LIVE", "FINISHED"]).optional(),
    limit: z.number().int().min(1).max(100).optional(),
});

export type CreateMatchInput = z.infer<typeof CreateMatchSchema>;
export type UpdateMatchInput = z.infer<typeof UpdateMatchSchema>;
