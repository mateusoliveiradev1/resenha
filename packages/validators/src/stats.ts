import { z } from "zod";

export const UpsertMatchStatsSchema = z.object({
    matchId: z.string().uuid(),
    stats: z.array(z.object({
        playerId: z.string().uuid(),
        goals: z.number().int().min(0).default(0),
        assists: z.number().int().min(0).default(0),
        yellowCards: z.number().int().min(0).default(0),
        redCards: z.number().int().min(0).default(0),
        minutesPlayed: z.number().int().min(0).optional().nullable(),
    }))
});

export const UpsertMatchAppearancesSchema = z.object({
    matchId: z.string().uuid(),
    appearances: z.array(z.object({
        playerId: z.string().uuid(),
        minutesPlayed: z.number().int().min(0).optional().nullable(),
    })),
});

export type UpsertMatchStatsInput = z.infer<typeof UpsertMatchStatsSchema>;
export type UpsertMatchAppearancesInput = z.infer<typeof UpsertMatchAppearancesSchema>;
