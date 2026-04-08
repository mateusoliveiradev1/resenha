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

const nullableUuidField = z.preprocess((value) => value === "" ? null : value, z.string().uuid().optional().nullable());
const nullableTextField = z.preprocess((value) => value === "" ? null : value, z.string().trim().optional().nullable());

function validateTiebreakFields(
    data: {
        scoreHome?: number | null;
        scoreAway?: number | null;
        tiebreakHome?: number | null;
        tiebreakAway?: number | null;
    },
    context: z.RefinementCtx,
) {
    const hasAnyTiebreak = data.tiebreakHome != null || data.tiebreakAway != null;

    if (!hasAnyTiebreak) {
        return;
    }

    if (data.tiebreakHome == null) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["tiebreakHome"],
            message: "Informe o desempate do mandante.",
        });
    }

    if (data.tiebreakAway == null) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["tiebreakAway"],
            message: "Informe o desempate do visitante.",
        });
    }

    if (data.scoreHome == null || data.scoreAway == null) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["scoreHome"],
            message: "Salve primeiro o placar do tempo normal para registrar o desempate.",
        });
        return;
    }

    if (data.scoreHome !== data.scoreAway) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["tiebreakHome"],
            message: "Use desempate apenas quando o tempo normal terminar empatado.",
        });
    }

    if (data.tiebreakHome != null && data.tiebreakAway != null && data.tiebreakHome === data.tiebreakAway) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["tiebreakHome"],
            message: "O desempate precisa indicar um vencedor.",
        });
    }
}

const MatchSchemaBase = z.object({
    date: z.string().min(1, "Data e hora da partida sao obrigatorias").refine(isValidMatchDate, "Data e hora invalidas"),
    opponent: z.preprocess((value) => value === "" ? null : value, z.string().trim().min(2, "Nome do adversario e obrigatorio").optional().nullable()),
    opponentLogo: z.string().trim().refine(isValidImageReference, "Informe uma URL valida ou use o upload do sistema").optional().nullable(),
    matchCategory: z.enum(["CHAMPIONSHIP", "FRIENDLY"]).default("FRIENDLY"),
    homeClubId: nullableUuidField,
    awayClubId: nullableUuidField,
    homeLabel: z.preprocess((value) => value === "" ? null : value, z.string().trim().min(2, "Informe o rotulo do mandante").optional().nullable()),
    awayLabel: z.preprocess((value) => value === "" ? null : value, z.string().trim().min(2, "Informe o rotulo do visitante").optional().nullable()),
    homeSourceType: z.enum(["STATIC", "GROUP_POSITION", "MATCH_WINNER", "MATCH_LOSER"]).optional().nullable(),
    awaySourceType: z.enum(["STATIC", "GROUP_POSITION", "MATCH_WINNER", "MATCH_LOSER"]).optional().nullable(),
    homeSourcePosition: nullableNumberField,
    awaySourcePosition: nullableNumberField,
    homeSourceMatchId: nullableUuidField,
    awaySourceMatchId: nullableUuidField,
    homeSourceGroupId: nullableUuidField,
    awaySourceGroupId: nullableUuidField,
    championshipId: nullableUuidField,
    championshipGroupId: nullableUuidField,
    phaseLabel: nullableTextField,
    roundLabel: nullableTextField,
    matchday: nullableNumberField,
    type: z.enum(["FUTSAL", "CAMPO"]),
    location: z.string().trim().min(2, "Local da partida e obrigatorio"),
    scoreHome: nullableNumberField,
    scoreAway: nullableNumberField,
    tiebreakHome: nullableNumberField,
    tiebreakAway: nullableNumberField,
    status: z.enum(["SCHEDULED", "LIVE", "FINISHED"]).default("SCHEDULED"),
    autoStatus: z.boolean().default(true),
    durationMinutes: nullableNumberField,
    season: z.preprocess((value) => value === "" ? null : value, z.string().trim().min(2, "Campeonato ou torneio e obrigatorio").optional().nullable()),
    summary: z.string().optional().nullable(),
});

export const CreateMatchSchema = MatchSchemaBase.superRefine((data, context) => {
    const hasHomeSide = Boolean(data.homeClubId || data.homeLabel || data.homeSourceType);
    const hasAwaySide = Boolean(data.awayClubId || data.awayLabel || data.awaySourceType);

    if (!hasHomeSide || !hasAwaySide) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["homeClubId"],
            message: "Defina mandante e visitante com clube ou rotulo oficial.",
        });
    }

    if (data.homeClubId && data.homeLabel) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["homeLabel"],
            message: "Use clube ou rotulo para o mandante, nao os dois.",
        });
    }

    if (data.awayClubId && data.awayLabel) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["awayLabel"],
            message: "Use clube ou rotulo para o visitante, nao os dois.",
        });
    }

    if (data.matchCategory === "CHAMPIONSHIP" && !data.championshipId) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["championshipId"],
            message: "Selecione o campeonato da partida.",
        });
    }

    if (data.homeSourceType === "GROUP_POSITION" && !data.homeSourcePosition) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["homeSourcePosition"],
            message: "Informe a posicao de classificacao do mandante.",
        });
    }

    if (data.awaySourceType === "GROUP_POSITION" && !data.awaySourcePosition) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["awaySourcePosition"],
            message: "Informe a posicao de classificacao do visitante.",
        });
    }

    if ((data.homeSourceType === "MATCH_WINNER" || data.homeSourceType === "MATCH_LOSER") && !data.homeSourceMatchId) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["homeSourceMatchId"],
            message: "Selecione a partida de origem do mandante.",
        });
    }

    if ((data.awaySourceType === "MATCH_WINNER" || data.awaySourceType === "MATCH_LOSER") && !data.awaySourceMatchId) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["awaySourceMatchId"],
            message: "Selecione a partida de origem do visitante.",
        });
    }

    validateTiebreakFields(data, context);
});

export const UpdateMatchSchema = MatchSchemaBase.partial().superRefine((data, context) => {
    const touchedHome =
        data.homeClubId !== undefined ||
        data.homeLabel !== undefined ||
        data.homeSourceType !== undefined;
    const touchedAway =
        data.awayClubId !== undefined ||
        data.awayLabel !== undefined ||
        data.awaySourceType !== undefined;

    if ((touchedHome && !data.homeClubId && !data.homeLabel && !data.homeSourceType) || (touchedAway && !data.awayClubId && !data.awayLabel && !data.awaySourceType)) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["homeClubId"],
            message: "Defina mandante e visitante com clube ou rotulo oficial.",
        });
    }

    if (data.homeClubId && data.homeLabel) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["homeLabel"],
            message: "Use clube ou rotulo para o mandante, nao os dois.",
        });
    }

    if (data.awayClubId && data.awayLabel) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["awayLabel"],
            message: "Use clube ou rotulo para o visitante, nao os dois.",
        });
    }

    if (data.matchCategory === "CHAMPIONSHIP" && !data.championshipId) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["championshipId"],
            message: "Selecione o campeonato da partida.",
        });
    }

    if (data.homeSourceType === "GROUP_POSITION" && !data.homeSourcePosition) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["homeSourcePosition"],
            message: "Informe a posicao de classificacao do mandante.",
        });
    }

    if (data.awaySourceType === "GROUP_POSITION" && !data.awaySourcePosition) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["awaySourcePosition"],
            message: "Informe a posicao de classificacao do visitante.",
        });
    }

    if ((data.homeSourceType === "MATCH_WINNER" || data.homeSourceType === "MATCH_LOSER") && !data.homeSourceMatchId) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["homeSourceMatchId"],
            message: "Selecione a partida de origem do mandante.",
        });
    }

    if ((data.awaySourceType === "MATCH_WINNER" || data.awaySourceType === "MATCH_LOSER") && !data.awaySourceMatchId) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["awaySourceMatchId"],
            message: "Selecione a partida de origem do visitante.",
        });
    }

    validateTiebreakFields(data, context);
});

export const MatchFilterSchema = z.object({
    type: z.enum(["FUTSAL", "CAMPO"]).optional(),
    status: z.enum(["SCHEDULED", "LIVE", "FINISHED"]).optional(),
    limit: z.number().int().min(1).max(100).optional(),
});

export type CreateMatchInput = z.infer<typeof CreateMatchSchema>;
export type UpdateMatchInput = z.infer<typeof UpdateMatchSchema>;
