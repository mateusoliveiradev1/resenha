import { z } from "zod";

const isValidDateTime = (value: string) => !Number.isNaN(new Date(value).getTime());

const optionalTextField = z.preprocess(
    (value) => value === "" ? null : value,
    z.string().trim().optional().nullable()
);

const optionalDateTimeField = z.preprocess(
    (value) => value === "" ? null : value,
    z.string().refine(isValidDateTime, "Data invalida").optional().nullable()
);

export const CreateChampionshipSchema = z.object({
    name: z.string().trim().min(2, "Nome do campeonato e obrigatorio"),
    slug: optionalTextField,
    description: optionalTextField,
    seasonLabel: z.string().trim().min(2, "Temporada/edicao e obrigatoria"),
    surface: z.enum(["CAMPO", "FUTSAL", "MISTO"]).default("CAMPO"),
    format: z.enum(["LEAGUE", "GROUP_STAGE", "KNOCKOUT", "HYBRID"]).default("LEAGUE"),
    status: z.enum(["PLANNED", "LIVE", "FINISHED"]).default("PLANNED"),
    pointsPerWin: z.coerce.number().int().min(0).default(3),
    pointsPerDraw: z.coerce.number().int().min(0).default(1),
    pointsPerLoss: z.coerce.number().int().min(0).default(0),
    showStandings: z.boolean().default(true),
    startsAt: optionalDateTimeField,
    endsAt: optionalDateTimeField,
});

export const UpdateChampionshipSchema = CreateChampionshipSchema.partial();

export const SaveChampionshipParticipantsSchema = z.object({
    championshipId: z.string().uuid(),
    clubIds: z.array(z.string().uuid()).default([]),
});

export type CreateChampionshipInput = z.infer<typeof CreateChampionshipSchema>;
export type UpdateChampionshipInput = z.infer<typeof UpdateChampionshipSchema>;
export type SaveChampionshipParticipantsInput = z.infer<typeof SaveChampionshipParticipantsSchema>;
