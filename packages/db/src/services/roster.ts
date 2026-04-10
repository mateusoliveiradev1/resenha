type RosterPlayerRecord = {
    id: string;
    name: string;
    nickname: string;
    position: "GOL" | "DEF" | "MEI" | "ATA";
    shirtNumber: number;
    photoUrl?: string | null;
    birthDate?: string | null;
    heightCm?: number | null;
    preferredFoot?: "DIREITO" | "ESQUERDO" | "AMBIDESTRO" | null;
    goals?: number | null;
    assists?: number | null;
};

type PlayerStatTotal = {
    playerId: string;
    goals: number;
    assists: number;
};

type PlayerAppearanceTotal = {
    playerId: string;
    matchesPlayed: number;
};

export type RosterPlayerSummary = {
    id: string;
    name: string;
    nickname: string;
    position: "GOL" | "DEF" | "MEI" | "ATA";
    shirtNumber: number;
    photoUrl?: string | null;
    stats: {
        goals: number;
        assists: number;
        matchesPlayed: number;
        age: number;
        heightCm: number;
        preferredFoot: "DIREITO" | "ESQUERDO" | "AMBIDESTRO";
    };
};

function calculateAge(birthDate?: string | null, referenceDate = new Date()) {
    if (!birthDate) {
        return 25;
    }

    const date = new Date(birthDate);

    if (Number.isNaN(date.getTime())) {
        return 25;
    }

    let age = referenceDate.getFullYear() - date.getFullYear();
    const monthDifference = referenceDate.getMonth() - date.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && referenceDate.getDate() < date.getDate())) {
        age -= 1;
    }

    return age;
}

export function buildRosterSummaries(args: {
    players: RosterPlayerRecord[];
    statTotals: PlayerStatTotal[];
    appearanceTotals: PlayerAppearanceTotal[];
    referenceDate?: Date;
}): RosterPlayerSummary[] {
    const statTotalsByPlayerId = new Map(
        args.statTotals.map((item) => [item.playerId, item]),
    );
    const appearanceTotalsByPlayerId = new Map(
        args.appearanceTotals.map((item) => [item.playerId, item.matchesPlayed]),
    );

    return args.players.map((player) => {
        const statTotals = statTotalsByPlayerId.get(player.id);
        const matchesPlayed = appearanceTotalsByPlayerId.get(player.id) ?? 0;

        return {
            id: player.id,
            name: player.name,
            nickname: player.nickname,
            position: player.position,
            shirtNumber: player.shirtNumber,
            photoUrl: player.photoUrl ?? null,
            stats: {
                goals: (player.goals ?? 0) + (statTotals?.goals ?? 0),
                assists: (player.assists ?? 0) + (statTotals?.assists ?? 0),
                matchesPlayed,
                age: calculateAge(player.birthDate ?? null, args.referenceDate),
                heightCm: player.heightCm ?? 175,
                preferredFoot: player.preferredFoot ?? "DIREITO",
            },
        };
    });
}
