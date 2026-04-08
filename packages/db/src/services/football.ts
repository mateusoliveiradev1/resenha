import type { clubs, championshipGroups, championshipParticipants, championships, matches } from "../schema";

export type ClubRecord = typeof clubs.$inferSelect;
export type ChampionshipRecord = typeof championships.$inferSelect;
export type ChampionshipGroupRecord = typeof championshipGroups.$inferSelect;
export type ChampionshipParticipantRecord = typeof championshipParticipants.$inferSelect;
export type MatchRecord = typeof matches.$inferSelect;
export type EffectiveMatchStatus = MatchRecord["status"];
export type MatchParticipantSourceType = NonNullable<MatchRecord["homeSourceType"]>;

export interface MatchPresentation {
    id: string;
    championshipId: string | null;
    championshipGroupId: string | null;
    date: Date;
    location: string;
    type: MatchRecord["type"];
    category: MatchRecord["matchCategory"];
    status: EffectiveMatchStatus;
    matchday: number | null;
    scoreHome: number | null;
    scoreAway: number | null;
    tiebreakHome: number | null;
    tiebreakAway: number | null;
    competitionName: string | null;
    phaseLabel: string | null;
    roundLabel: string | null;
    groupName: string | null;
    resenhaClubId: string | null;
    isResenhaMatch: boolean;
    isResenhaHome: boolean;
    homeTeam: {
        id: string | null;
        name: string;
        shortName: string;
        logoUrl: string | null;
    };
    awayTeam: {
        id: string | null;
        name: string;
        shortName: string;
        logoUrl: string | null;
    };
    opponentName: string;
    opponentLogo: string | null;
}

export interface StandingRow {
    position: number;
    clubId: string;
    clubName: string;
    clubShortName: string;
    clubLogoUrl: string | null;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    efficiency: number;
}

interface PresentedMatchesArgs {
    matches: MatchRecord[];
    clubs: ClubRecord[];
    championships?: ChampionshipRecord[];
    groups?: ChampionshipGroupRecord[];
    participants?: ChampionshipParticipantRecord[];
    now?: Date;
}

type MatchSideKey = "home" | "away";

interface ResolvedSideState {
    clubId: string | null;
    label: string | null;
}

interface ResolvedMatchState {
    home: ResolvedSideState;
    away: ResolvedSideState;
}

interface MatchSourceDescriptor {
    sourceType: MatchParticipantSourceType | "STATIC";
    sourcePosition: number | null;
    sourceMatchId: string | null;
    sourceGroupId: string | null;
    parsedMatchNumber: number | null;
    parsedGroupName: string | null;
}

function normalizeShortName(name: string, shortName?: string | null) {
    if (shortName?.trim()) {
        return shortName.trim();
    }

    return name.length > 18 ? name.slice(0, 18) : name;
}

function normalizePattern(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeOptionalLabel(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}

function parseAutomaticSourceLabel(label?: string | null) {
    const normalized = normalizeOptionalLabel(label);

    if (!normalized) {
        return null;
    }

    const parsed = normalizePattern(normalized);
    const positionMatch = parsed.match(/^(\d+)(?:O|º|°)?\s*(?:COLOCADO|LUGAR)(?:\s+DO\s+GRUPO\s+(.+))?$/);

    if (positionMatch) {
        return {
            sourceType: "GROUP_POSITION" as const,
            sourcePosition: Number(positionMatch[1]),
            sourceMatchNumber: null,
            groupName: positionMatch[2]?.trim() ?? null,
        };
    }

    const knockoutMatch = parsed.match(/^(VENC|VENCEDOR|PERD|PERDEDOR)\s+(?:DO\s+)?JOGO\s+(\d+)$/);

    if (knockoutMatch) {
        return {
            sourceType: knockoutMatch[1].startsWith("VENC") ? "MATCH_WINNER" as const : "MATCH_LOSER" as const,
            sourcePosition: null,
            sourceMatchNumber: Number(knockoutMatch[2]),
            groupName: null,
        };
    }

    return null;
}

export function getDefaultDurationMinutes(type: MatchRecord["type"]) {
    return type === "FUTSAL" ? 55 : 115;
}

export function getEffectiveMatchStatus(match: Pick<MatchRecord, "autoStatus" | "date" | "durationMinutes" | "status" | "type">, now = new Date()): EffectiveMatchStatus {
    if (match.status === "FINISHED" || match.status === "LIVE") {
        return match.status;
    }

    if (!match.autoStatus) {
        return match.status;
    }

    const startTime = new Date(match.date).getTime();
    const endTime = startTime + (match.durationMinutes ?? getDefaultDurationMinutes(match.type)) * 60 * 1000;
    const currentTime = now.getTime();

    if (currentTime >= startTime && currentTime <= endTime) {
        return "LIVE";
    }

    if (currentTime > endTime) {
        return "FINISHED";
    }

    return "SCHEDULED";
}

export function buildLookupMap<T extends { id: string }>(items: T[]) {
    return new Map(items.map((item) => [item.id, item]));
}

export function getResenhaClub(clubsList: ClubRecord[]) {
    return clubsList.find((club) => club.isResenha) ?? null;
}

function getLegacyHomeTeam() {
    return {
        id: null,
        name: "Resenha RFC",
        shortName: "Resenha",
        logoUrl: "/logo2.png",
    };
}

function getClubPresentation(club: ClubRecord | null | undefined, fallbackName: string, fallbackLogo: string | null = null) {
    if (!club) {
        return {
            id: null,
            name: fallbackName,
            shortName: normalizeShortName(fallbackName),
            logoUrl: fallbackLogo,
        };
    }

    return {
        id: club.id,
        name: club.name,
        shortName: normalizeShortName(club.name, club.shortName),
        logoUrl: club.logoUrl ?? (club.isResenha ? "/logo2.png" : null),
    };
}

function getLabeledTeamPresentation(label: string) {
    return {
        id: null,
        name: label,
        shortName: normalizeShortName(label),
        logoUrl: null,
    };
}

function createInitialResolvedState(match: MatchRecord): ResolvedMatchState {
    return {
        home: {
            clubId: match.homeClubId ?? null,
            label: normalizeOptionalLabel(match.homeLabel),
        },
        away: {
            clubId: match.awayClubId ?? null,
            label: normalizeOptionalLabel(match.awayLabel),
        },
    };
}

function getSourceDescriptor(match: MatchRecord, side: MatchSideKey): MatchSourceDescriptor {
    const label = normalizeOptionalLabel(side === "home" ? match.homeLabel : match.awayLabel);
    const parsed = parseAutomaticSourceLabel(label);

    return {
        sourceType: (side === "home" ? match.homeSourceType : match.awaySourceType) ?? parsed?.sourceType ?? "STATIC",
        sourcePosition: (side === "home" ? match.homeSourcePosition : match.awaySourcePosition) ?? parsed?.sourcePosition ?? null,
        sourceMatchId: (side === "home" ? match.homeSourceMatchId : match.awaySourceMatchId) ?? null,
        sourceGroupId: (side === "home" ? match.homeSourceGroupId : match.awaySourceGroupId) ?? null,
        parsedMatchNumber: parsed?.sourceMatchNumber ?? null,
        parsedGroupName: parsed?.groupName ?? null,
    };
}

function buildGroupNameLookup(groupsList: ChampionshipGroupRecord[]) {
    return new Map(
        groupsList.map((group) => [
            `${group.championshipId}:${normalizePattern(group.name)}`,
            group,
        ]),
    );
}

function findSourceMatchId(args: {
    match: MatchRecord;
    descriptor: MatchSourceDescriptor;
    matchesList: MatchRecord[];
}) {
    if (args.descriptor.sourceMatchId) {
        return args.descriptor.sourceMatchId;
    }

    if (!args.descriptor.parsedMatchNumber || !args.match.championshipId) {
        return null;
    }

    const normalizedRoundLabel = normalizePattern(`Jogo ${args.descriptor.parsedMatchNumber}`);

    return args.matchesList.find((candidate) =>
        candidate.id !== args.match.id &&
        candidate.championshipId === args.match.championshipId &&
        (
            candidate.matchday === args.descriptor.parsedMatchNumber ||
            normalizePattern(candidate.roundLabel ?? "") === normalizedRoundLabel
        )
    )?.id ?? null;
}

function buildMatchPresentation(args: {
    match: MatchRecord;
    state: ResolvedMatchState;
    clubsById: Map<string, ClubRecord>;
    championshipsById: Map<string, ChampionshipRecord>;
    groupsById: Map<string, ChampionshipGroupRecord>;
    resenhaClub: ClubRecord | null;
    now: Date;
}) {
    const { match, state, clubsById, championshipsById, groupsById, resenhaClub, now } = args;
    const status = getEffectiveMatchStatus(match, now);
    const homeClub = state.home.clubId ? clubsById.get(state.home.clubId) ?? null : null;
    const awayClub = state.away.clubId ? clubsById.get(state.away.clubId) ?? null : null;
    const legacyHomeTeam = getLegacyHomeTeam();
    const homeTeam = homeClub
        ? getClubPresentation(homeClub, legacyHomeTeam.name, legacyHomeTeam.logoUrl)
        : state.home.label
            ? getLabeledTeamPresentation(state.home.label)
            : legacyHomeTeam;
    const awayTeam = awayClub
        ? getClubPresentation(awayClub, match.opponent, match.opponentLogo ?? null)
        : state.away.label
            ? getLabeledTeamPresentation(state.away.label)
            : getClubPresentation(null, match.opponent, match.opponentLogo ?? null);
    const competition = match.championshipId ? championshipsById.get(match.championshipId) ?? null : null;
    const group = match.championshipGroupId ? groupsById.get(match.championshipGroupId) ?? null : null;
    const hasExplicitLabels = Boolean(state.home.label || state.away.label);
    const isResenhaHome = Boolean(resenhaClub && homeTeam.id === resenhaClub.id) || (!homeClub && !awayClub && !hasExplicitLabels);
    const isResenhaAway = Boolean(resenhaClub && awayTeam.id === resenhaClub.id);
    const isResenhaMatch = isResenhaHome || isResenhaAway || (!homeClub && !awayClub && !hasExplicitLabels);
    const opponent = isResenhaAway ? homeTeam : awayTeam;

    const presentation: MatchPresentation = {
        id: match.id,
        championshipId: match.championshipId ?? null,
        championshipGroupId: match.championshipGroupId ?? null,
        date: new Date(match.date),
        location: match.location,
        type: match.type,
        category: match.matchCategory,
        status,
        matchday: match.matchday ?? null,
        scoreHome: match.scoreHome ?? null,
        scoreAway: match.scoreAway ?? null,
        tiebreakHome: match.tiebreakHome ?? null,
        tiebreakAway: match.tiebreakAway ?? null,
        competitionName: competition?.name ?? match.season ?? null,
        phaseLabel: match.phaseLabel ?? group?.phaseLabel ?? null,
        roundLabel: match.roundLabel ?? null,
        groupName: group?.name ?? null,
        resenhaClubId: resenhaClub?.id ?? null,
        isResenhaMatch,
        isResenhaHome,
        homeTeam,
        awayTeam,
        opponentName: opponent.name,
        opponentLogo: opponent.logoUrl,
    };

    return presentation;
}

function buildStandingsIndex(args: {
    presentations: MatchPresentation[];
    championshipsList: ChampionshipRecord[];
    participants: ChampionshipParticipantRecord[];
    clubs: ClubRecord[];
}) {
    const participantsByChampionship = new Map<string, ChampionshipParticipantRecord[]>();
    const championshipIds = new Set<string>();
    const keys = new Set<string>();

    for (const participant of args.participants) {
        const current = participantsByChampionship.get(participant.championshipId) ?? [];
        current.push(participant);
        participantsByChampionship.set(participant.championshipId, current);
        championshipIds.add(participant.championshipId);

        if (participant.championshipGroupId) {
            keys.add(`${participant.championshipId}:${participant.championshipGroupId}`);
        }
    }

    for (const match of args.presentations) {
        if (!match.championshipId) {
            continue;
        }

        championshipIds.add(match.championshipId);

        if (match.championshipGroupId) {
            keys.add(`${match.championshipId}:${match.championshipGroupId}`);
        }
    }

    const standingsIndex = new Map<string, StandingRow[]>();

    for (const championship of args.championshipsList) {
        if (!championshipIds.has(championship.id)) {
            continue;
        }

        const championshipParticipantsList = participantsByChampionship.get(championship.id) ?? [];
        standingsIndex.set(
            `${championship.id}:all`,
            buildStandings({
                championship,
                participants: championshipParticipantsList.map((participant) => ({ clubId: participant.clubId })),
                matches: args.presentations.filter((match) => match.championshipId === championship.id),
                clubs: args.clubs,
            }),
        );
    }

    for (const key of keys) {
        const [championshipId, groupId] = key.split(":");
        const championship = args.championshipsList.find((item) => item.id === championshipId);

        if (!championship) {
            continue;
        }

        const championshipParticipantsList = (participantsByChampionship.get(championshipId) ?? [])
            .filter((participant) => participant.championshipGroupId === groupId);

        standingsIndex.set(
            key,
            buildStandings({
                championship,
                participants: championshipParticipantsList.map((participant) => ({ clubId: participant.clubId })),
                matches: args.presentations.filter((match) => match.championshipId === championshipId),
                clubs: args.clubs,
                championshipGroupId: groupId,
            }),
        );
    }

    return standingsIndex;
}

function getKnockoutDecision(match: MatchPresentation | null | undefined) {
    if (!match?.homeTeam.id || !match.awayTeam.id) {
        return null;
    }

    if (match.scoreHome == null || match.scoreAway == null) {
        return null;
    }

    if (match.scoreHome !== match.scoreAway) {
        return {
            winnerId: match.scoreHome > match.scoreAway ? match.homeTeam.id : match.awayTeam.id,
            loserId: match.scoreHome > match.scoreAway ? match.awayTeam.id : match.homeTeam.id,
            decidedByTiebreak: false,
        };
    }

    if (
        match.tiebreakHome == null ||
        match.tiebreakAway == null ||
        match.tiebreakHome === match.tiebreakAway
    ) {
        return null;
    }

    return {
        winnerId: match.tiebreakHome > match.tiebreakAway ? match.homeTeam.id : match.awayTeam.id,
        loserId: match.tiebreakHome > match.tiebreakAway ? match.awayTeam.id : match.homeTeam.id,
        decidedByTiebreak: true,
    };
}

function resolveKnockoutClubId(args: {
    descriptor: MatchSourceDescriptor;
    sourcePresentation: MatchPresentation | null | undefined;
}) {
    const decision = getKnockoutDecision(args.sourcePresentation);

    if (!decision) {
        return null;
    }

    return args.descriptor.sourceType === "MATCH_WINNER" ? decision.winnerId : decision.loserId;
}

function resolveMatchState(args: {
    match: MatchRecord;
    currentState: ResolvedMatchState;
    standingsIndex: Map<string, StandingRow[]>;
    presentationsById: Map<string, MatchPresentation>;
    matchesList: MatchRecord[];
    groupNameLookup: Map<string, ChampionshipGroupRecord>;
}) {
    const nextState: ResolvedMatchState = {
        home: { ...args.currentState.home },
        away: { ...args.currentState.away },
    };

    for (const side of ["home", "away"] as const) {
        const descriptor = getSourceDescriptor(args.match, side);
        const staticClubId = side === "home" ? args.match.homeClubId ?? null : args.match.awayClubId ?? null;
        const staticLabel = normalizeOptionalLabel(side === "home" ? args.match.homeLabel : args.match.awayLabel);

        if (descriptor.sourceType === "STATIC") {
            nextState[side] = {
                clubId: staticClubId,
                label: staticLabel,
            };
            continue;
        }

        if (descriptor.sourceType === "GROUP_POSITION") {
            const sourceGroupId =
                descriptor.sourceGroupId ??
                (descriptor.parsedGroupName && args.match.championshipId
                    ? args.groupNameLookup.get(`${args.match.championshipId}:${normalizePattern(descriptor.parsedGroupName)}`)?.id ?? null
                    : null);
            const key = `${args.match.championshipId ?? ""}:${sourceGroupId ?? "all"}`;
            const standings = args.standingsIndex.get(key) ?? [];
            const resolvedClub = standings.find((row) => row.position === descriptor.sourcePosition);

            nextState[side] = {
                clubId: resolvedClub?.clubId ?? null,
                label: staticLabel,
            };
            continue;
        }

        const sourceMatchId = findSourceMatchId({
            match: args.match,
            descriptor,
            matchesList: args.matchesList,
        });
        const resolvedClubId = resolveKnockoutClubId({
            descriptor,
            sourcePresentation: sourceMatchId ? args.presentationsById.get(sourceMatchId) : null,
        });

        nextState[side] = {
            clubId: resolvedClubId,
            label: staticLabel,
        };
    }

    return nextState;
}

function resolvedStateChanged(currentState: ResolvedMatchState, nextState: ResolvedMatchState) {
    return (
        currentState.home.clubId !== nextState.home.clubId ||
        currentState.home.label !== nextState.home.label ||
        currentState.away.clubId !== nextState.away.clubId ||
        currentState.away.label !== nextState.away.label
    );
}

export function presentMatches(args: PresentedMatchesArgs) {
    const now = args.now ?? new Date();
    const championshipsList = args.championships ?? [];
    const groupsList = args.groups ?? [];
    const clubsById = buildLookupMap(args.clubs);
    const championshipsById = buildLookupMap(championshipsList);
    const groupsById = buildLookupMap(groupsList);
    const groupNameLookup = buildGroupNameLookup(groupsList);
    const resenhaClub = getResenhaClub(args.clubs);
    const resolvedStates = new Map(args.matches.map((match) => [match.id, createInitialResolvedState(match)]));
    const maxIterations = Math.max(args.matches.length, 1) + 1;

    let presentations = args.matches.map((match) =>
        buildMatchPresentation({
            match,
            state: resolvedStates.get(match.id) ?? createInitialResolvedState(match),
            clubsById,
            championshipsById,
            groupsById,
            resenhaClub,
            now,
        }),
    );

    for (let iteration = 0; iteration < maxIterations; iteration += 1) {
        const standingsIndex = buildStandingsIndex({
            presentations,
            championshipsList,
            participants: args.participants ?? [],
            clubs: args.clubs,
        });
        const presentationsById = buildLookupMap(presentations);
        let changed = false;

        for (const match of args.matches) {
            const currentState = resolvedStates.get(match.id) ?? createInitialResolvedState(match);
            const nextState = resolveMatchState({
                match,
                currentState,
                standingsIndex,
                presentationsById,
                matchesList: args.matches,
                groupNameLookup,
            });

            if (resolvedStateChanged(currentState, nextState)) {
                resolvedStates.set(match.id, nextState);
                changed = true;
            }
        }

        presentations = args.matches.map((match) =>
            buildMatchPresentation({
                match,
                state: resolvedStates.get(match.id) ?? createInitialResolvedState(match),
                clubsById,
                championshipsById,
                groupsById,
                resenhaClub,
                now,
            }),
        );

        if (!changed) {
            break;
        }
    }

    return presentations;
}

export function presentMatch(
    match: MatchRecord,
    clubsList: ClubRecord[],
    championshipsList: ChampionshipRecord[] = [],
    groupsList: ChampionshipGroupRecord[] = [],
    now = new Date()
) {
    return presentMatches({
        matches: [match],
        clubs: clubsList,
        championships: championshipsList,
        groups: groupsList,
        now,
    })[0];
}

export function sortMatchesForDisplay(matchesList: MatchPresentation[]) {
    const statusPriority: Record<EffectiveMatchStatus, number> = {
        LIVE: 0,
        SCHEDULED: 1,
        FINISHED: 2,
    };

    return [...matchesList].sort((left, right) => {
        const statusDifference = statusPriority[left.status] - statusPriority[right.status];

        if (statusDifference !== 0) {
            return statusDifference;
        }

        const leftDate = left.date.getTime();
        const rightDate = right.date.getTime();

        if (left.status === "FINISHED" && right.status === "FINISHED") {
            return rightDate - leftDate;
        }

        return leftDate - rightDate;
    });
}

export function pickFeaturedMatch(matchesList: MatchPresentation[]) {
    const resenhaMatches = matchesList.filter((match) => match.isResenhaMatch);
    const liveMatch = resenhaMatches
        .filter((match) => match.status === "LIVE")
        .sort((left, right) => left.date.getTime() - right.date.getTime())[0];

    if (liveMatch) {
        return liveMatch;
    }

    return resenhaMatches
        .filter((match) => match.status === "SCHEDULED")
        .sort((left, right) => left.date.getTime() - right.date.getTime())[0] ?? null;
}

export function buildStandings(args: {
    championship: ChampionshipRecord;
    participants: Array<{ clubId: string }>;
    matches: MatchPresentation[];
    clubs: ClubRecord[];
    championshipGroupId?: string | null;
}) {
    const clubsById = buildLookupMap(args.clubs);
    const rows = new Map<string, StandingRow>();

    const ensureRow = (clubId: string) => {
        const existingRow = rows.get(clubId);

        if (existingRow) {
            return existingRow;
        }

        const club = clubsById.get(clubId);

        const row: StandingRow = {
            position: 0,
            clubId,
            clubName: club?.name ?? "Clube",
            clubShortName: normalizeShortName(club?.name ?? "Clube", club?.shortName),
            clubLogoUrl: club?.logoUrl ?? null,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            efficiency: 0,
        };

        rows.set(clubId, row);
        return row;
    };

    for (const participant of args.participants) {
        ensureRow(participant.clubId);
    }

    const hasGroupedMatches = args.matches.some((match) => match.championshipGroupId != null);
    const requiresGroupFilter = hasGroupedMatches && (args.championship.format === "GROUP_STAGE" || args.championship.format === "HYBRID");

    const relevantMatches = args.matches.filter((match) => {
        if (match.category !== "CHAMPIONSHIP" || match.status !== "FINISHED") {
            return false;
        }

        if (match.scoreHome == null || match.scoreAway == null) {
            return false;
        }

        if (args.championshipGroupId) {
            return match.championshipGroupId === args.championshipGroupId && Boolean(match.homeTeam.id && match.awayTeam.id);
        }

        if (args.championship.format === "KNOCKOUT") {
            return false;
        }

        if (requiresGroupFilter && !match.championshipGroupId) {
            return false;
        }

        return Boolean(match.homeTeam.id && match.awayTeam.id);
    });

    for (const match of relevantMatches) {
        if (!match.homeTeam.id || !match.awayTeam.id || match.scoreHome == null || match.scoreAway == null) {
            continue;
        }

        const homeRow = ensureRow(match.homeTeam.id);
        const awayRow = ensureRow(match.awayTeam.id);

        homeRow.played += 1;
        awayRow.played += 1;
        homeRow.goalsFor += match.scoreHome;
        homeRow.goalsAgainst += match.scoreAway;
        awayRow.goalsFor += match.scoreAway;
        awayRow.goalsAgainst += match.scoreHome;

        if (match.scoreHome > match.scoreAway) {
            homeRow.wins += 1;
            awayRow.losses += 1;
            homeRow.points += args.championship.pointsPerWin;
            awayRow.points += args.championship.pointsPerLoss;
        } else if (match.scoreHome < match.scoreAway) {
            awayRow.wins += 1;
            homeRow.losses += 1;
            awayRow.points += args.championship.pointsPerWin;
            homeRow.points += args.championship.pointsPerLoss;
        } else {
            homeRow.draws += 1;
            awayRow.draws += 1;
            homeRow.points += args.championship.pointsPerDraw;
            awayRow.points += args.championship.pointsPerDraw;
        }
    }

    const orderedRows = [...rows.values()]
        .map((row) => ({
            ...row,
            goalDifference: row.goalsFor - row.goalsAgainst,
            efficiency: row.played > 0 ? Math.round((row.points / (row.played * Math.max(args.championship.pointsPerWin, 1))) * 100) : 0,
        }))
        .sort((left, right) => {
            if (right.points !== left.points) return right.points - left.points;
            if (right.goalDifference !== left.goalDifference) return right.goalDifference - left.goalDifference;
            if (right.goalsFor !== left.goalsFor) return right.goalsFor - left.goalsFor;
            if (right.wins !== left.wins) return right.wins - left.wins;
            return left.clubName.localeCompare(right.clubName, "pt-BR");
        })
        .map((row, index) => ({
            ...row,
            position: index + 1,
        }));

    return orderedRows;
}
