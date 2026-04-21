export type PlacarsoftFetch = (input: string | URL, init?: RequestInit) => Promise<Response>;

export interface PlacarsoftCompetitionSource {
    id: string;
    localSlug: string;
    portalHost: string;
    portal: number;
    discoveryApiBaseUrl: string;
    apiBaseUrl: string;
    competitionId: string;
    phaseId: string;
    groupId: string;
    sourcePageUrl: string;
}

export interface PlacarsoftTableData {
    games?: number | string | null;
    points?: number | string | null;
    wins?: number | string | null;
    draws?: number | string | null;
    loses?: number | string | null;
    losses?: number | string | null;
    score_scored?: number | string | null;
    score_conceded?: number | string | null;
}

export interface PlacarsoftTableRow {
    id: string | number;
    name: string;
    shortname?: string | null;
    data?: PlacarsoftTableData | null;
    uri?: string | null;
    form?: readonly string[] | null;
    shield_thumb_url?: string | null;
    shield_thumb_composition?: readonly string[] | null;
    index: number | string;
}

export interface PlacarsoftDuel {
    id: string | number;
    name?: string | null;
    team_1_name?: string | null;
    team_1_shortname?: string | null;
    team_1_shield_thumb_url?: string | null;
    team_2_name?: string | null;
    team_2_shortname?: string | null;
    team_2_shield_thumb_url?: string | null;
    t1_team_id?: string | number | null;
    t2_team_id?: string | number | null;
    starts_at_formatted?: string | null;
    score_1_formatted?: string | number | null;
    score_2_formatted?: string | number | null;
    subscore_1_formatted?: string | number | null;
    subscore_2_formatted?: string | number | null;
    space_name?: string | null;
    address?: string | null;
    public_uri?: string | null;
    result_name?: string | null;
    live?: boolean | null;
    done?: boolean | null;
}

export interface PlacarsoftRound {
    id: string | number;
    order?: number | string | null;
    name?: string | null;
    duels?: readonly PlacarsoftDuel[] | null;
}

export interface PlacarsoftGroupResponse {
    status?: number | string | null;
    updated_at?: string | null;
    current_round_id?: string | number | null;
    cached?: boolean | null;
    result?: {
        id?: string | number | null;
        name?: string | null;
        table?: readonly PlacarsoftTableRow[] | null;
        rounds?: readonly PlacarsoftRound[] | null;
        phase?: {
            id?: string | number | null;
            name?: string | null;
        } | null;
        competition?: {
            id?: string | number | null;
            name?: string | null;
            nickname?: string | null;
            common_name?: string | null;
            slug?: string | null;
            public_uri?: string | null;
        } | null;
    } | null;
}

export type PlacarsoftRecentFormResult = "W" | "D" | "L";
export type PlacarsoftGameStatus = "FINISHED" | "LIVE" | "SCHEDULED";

export interface PlacarsoftStandingRow {
    position: number;
    clubId: string;
    sourceTeamId: string;
    clubName: string;
    clubShortName: string;
    clubLogoUrl: string | null;
    sourceUri: string | null;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    efficiency: number;
    recentForm: PlacarsoftRecentFormResult[];
}

export interface PlacarsoftGameTeam {
    sourceTeamId: string | null;
    name: string;
    shortName: string;
    logoUrl: string | null;
}

export interface PlacarsoftGame {
    id: string;
    sourceGameId: string;
    name: string;
    roundId: string;
    roundName: string;
    roundOrder: number;
    matchday: number | null;
    date: Date;
    startsAt: string | null;
    location: string;
    status: PlacarsoftGameStatus;
    publicUri: string | null;
    resultName: string | null;
    scoreHome: number | null;
    scoreAway: number | null;
    tiebreakHome: number | null;
    tiebreakAway: number | null;
    homeTeam: PlacarsoftGameTeam;
    awayTeam: PlacarsoftGameTeam;
}

export interface PlacarsoftNormalizedRound {
    id: string;
    sourceRoundId: string;
    order: number;
    name: string;
    title: string;
    matchday: number | null;
    games: PlacarsoftGame[];
}

export interface PlacarsoftFreshness {
    updatedAt: string | null;
    updatedAtDate: Date | null;
    fetchedAt: Date;
    currentRoundId: string | null;
    cached: boolean;
}

export interface PlacarsoftCompetitionData {
    source: PlacarsoftCompetitionSource;
    sourcePageUrl: string;
    apiBaseUrl: string;
    group: {
        id: string;
        name: string;
    };
    phase: {
        id: string;
        name: string;
    };
    competition: {
        id: string;
        name: string;
        nickname: string | null;
        commonName: string | null;
        slug: string | null;
        publicUri: string | null;
    };
    freshness: PlacarsoftFreshness;
    standings: PlacarsoftStandingRow[];
    rounds: PlacarsoftNormalizedRound[];
    games: PlacarsoftGame[];
}

interface PlacarsoftClientDiscoveryResponse {
    status?: number | string | null;
    client?: {
        backend?: string | null;
        backend_list?: readonly string[] | null;
    } | null;
}

export class PlacarsoftError extends Error {
    constructor(message: string, readonly cause?: unknown) {
        super(message);
        this.name = "PlacarsoftError";
    }
}

export const PIRANGI_FUTSAL_7_DE_MARCO_SOURCE = {
    id: "pirangi-futsal-7-de-marco-maciel-da-costa-da-conceicao",
    localSlug: "campeonato-municipal-de-futsal-7-de-marco-2026",
    portalHost: "pirangi.portal.placarsoft.com.br",
    portal: 1,
    discoveryApiBaseUrl: "https://core.b6.placarsoft.com/api/v1",
    apiBaseUrl: "https://pirangi.b05.mandalore.esp.br/api/v1",
    competitionId: "544099817090171200",
    phaseId: "28",
    groupId: "19",
    sourcePageUrl:
        "https://pirangi.portal.placarsoft.com.br/campeonatos/544099817090171200/futsal-7-de-marco-maciel-da-costa-da-conceicao/classificacao-e-jogos",
} as const satisfies PlacarsoftCompetitionSource;

export const OFFICIAL_PLACARSOFT_SOURCES_BY_SLUG = {
    [PIRANGI_FUTSAL_7_DE_MARCO_SOURCE.localSlug]: PIRANGI_FUTSAL_7_DE_MARCO_SOURCE,
    "futsal-7-de-marco-maciel-da-costa-da-conceicao": PIRANGI_FUTSAL_7_DE_MARCO_SOURCE,
} as const;

export function getOfficialPlacarsoftSource(slug: string) {
    return OFFICIAL_PLACARSOFT_SOURCES_BY_SLUG[slug as keyof typeof OFFICIAL_PLACARSOFT_SOURCES_BY_SLUG] ?? null;
}

function toStringValue(value: unknown, fallback = "") {
    if (typeof value === "string") {
        return value.trim() || fallback;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }

    return fallback;
}

function toOptionalString(value: unknown) {
    const normalized = toStringValue(value);

    return normalized || null;
}

function toNumber(value: unknown, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.trim().replace(",", ".");

        if (!normalized) {
            return fallback;
        }

        const parsed = Number(normalized);

        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return fallback;
}

function toOptionalNumber(value: unknown) {
    if (value === "" || value == null) {
        return null;
    }

    const parsed = toNumber(value, Number.NaN);

    return Number.isFinite(parsed) ? parsed : null;
}

function normalizeShortName(name: string, shortName?: string | null) {
    const normalizedShortName = shortName?.trim();

    if (normalizedShortName) {
        return normalizedShortName;
    }

    return name.length > 18 ? name.slice(0, 18) : name;
}

function normalizeFormValue(value: string): PlacarsoftRecentFormResult | null {
    switch (value.trim().toLowerCase()) {
        case "w":
            return "W";
        case "d":
            return "D";
        case "l":
            return "L";
        default:
            return null;
    }
}

function parseBrazilDateTime(value?: string | null) {
    const match = value?.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);

    if (!match) {
        return null;
    }

    const [, day, month, year, hour, minute, second] = match;

    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second ?? "00"}-03:00`);
}

function getRoundNumber(name: string, fallback: number) {
    const match = name.match(/\d+/);

    return match ? Number(match[0]) : fallback;
}

function formatRoundTitle(matchday: number | null, fallback: string) {
    if (!matchday || !Number.isFinite(matchday)) {
        return fallback;
    }

    return `${matchday}a Rodada`;
}

function getTeamLogoUrl(primary?: string | null, composition?: readonly string[] | null) {
    return primary?.trim() || composition?.find((item) => item.trim())?.trim() || null;
}

function getGameStatus(duel: PlacarsoftDuel): PlacarsoftGameStatus {
    if (duel.live) {
        return "LIVE";
    }

    if (duel.done) {
        return "FINISHED";
    }

    return "SCHEDULED";
}

function normalizeApiBaseUrl(url: string) {
    const trimmed = url.replace(/\/+$/, "");

    if (trimmed.endsWith("/api/v1")) {
        return trimmed;
    }

    return `${trimmed}/api/v1`;
}

function buildDiscoveryUrl(source: PlacarsoftCompetitionSource) {
    const url = new URL(`${source.discoveryApiBaseUrl.replace(/\/+$/, "")}/placarsoft/client`);
    url.searchParams.set("host", source.portalHost);
    url.searchParams.set("portal", String(source.portal));

    return url;
}

async function fetchJson<T>(
    url: string | URL,
    options: {
        fetcher: PlacarsoftFetch;
        timeoutMs: number;
    },
) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
        const response = await options.fetcher(url, { signal: controller.signal });

        if (!response.ok) {
            throw new PlacarsoftError(`Placarsoft request failed with HTTP ${response.status}`);
        }

        return await response.json() as T;
    } catch (error) {
        if (controller.signal.aborted) {
            throw new PlacarsoftError(`Placarsoft request timed out after ${options.timeoutMs}ms`, error);
        }

        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function discoverPlacarsoftApiBaseUrl(
    source: PlacarsoftCompetitionSource,
    options: {
        fetcher?: PlacarsoftFetch;
        timeoutMs?: number;
    } = {},
) {
    const fetcher = options.fetcher ?? fetch;
    const timeoutMs = options.timeoutMs ?? 6_000;
    const discovery = await fetchJson<PlacarsoftClientDiscoveryResponse>(buildDiscoveryUrl(source), {
        fetcher,
        timeoutMs,
    });

    if (toNumber(discovery.status) !== 1) {
        throw new PlacarsoftError("Placarsoft discovery returned an unsuccessful status");
    }

    const backend = discovery.client?.backend ?? discovery.client?.backend_list?.[0] ?? null;

    if (!backend) {
        throw new PlacarsoftError("Placarsoft discovery did not include a backend URL");
    }

    return normalizeApiBaseUrl(backend);
}

export function normalizePlacarsoftGroupResponse(
    response: PlacarsoftGroupResponse,
    source: PlacarsoftCompetitionSource = PIRANGI_FUTSAL_7_DE_MARCO_SOURCE,
    options: {
        apiBaseUrl?: string;
        fetchedAt?: Date;
    } = {},
): PlacarsoftCompetitionData {
    if (toNumber(response.status) !== 1) {
        throw new PlacarsoftError("Placarsoft group response returned an unsuccessful status");
    }

    const result = response.result;

    if (!result) {
        throw new PlacarsoftError("Placarsoft group response is missing result data");
    }

    const standings = [...(result.table ?? [])]
        .map((row) => {
            const data = row.data ?? {};
            const played = toNumber(data.games);
            const wins = toNumber(data.wins);
            const losses = toNumber(data.loses ?? data.losses);
            const draws = toNumber(data.draws, Math.max(played - wins - losses, 0));
            const goalsFor = toNumber(data.score_scored);
            const goalsAgainst = toNumber(data.score_conceded);
            const points = toNumber(data.points);
            const position = toNumber(row.index);
            const clubName = toStringValue(row.name, "Clube");
            const sourceTeamId = toStringValue(row.id);

            return {
                position,
                clubId: `placarsoft:${sourceTeamId}`,
                sourceTeamId,
                clubName,
                clubShortName: normalizeShortName(clubName, row.shortname),
                clubLogoUrl: getTeamLogoUrl(row.shield_thumb_url, row.shield_thumb_composition),
                sourceUri: row.uri?.trim() || null,
                played,
                wins,
                draws,
                losses,
                goalsFor,
                goalsAgainst,
                goalDifference: goalsFor - goalsAgainst,
                points,
                efficiency: played > 0 ? Math.round((points / (played * 3)) * 100) : 0,
                recentForm: (row.form ?? [])
                    .map(normalizeFormValue)
                    .filter((item): item is PlacarsoftRecentFormResult => Boolean(item)),
            };
        })
        .sort((left, right) => left.position - right.position);

    const rounds = [...(result.rounds ?? [])]
        .map((round) => {
            const roundName = toStringValue(round.name, "Rodada");
            const roundOrder = toNumber(round.order, 0);
            const matchday = getRoundNumber(roundName, roundOrder);
            const roundId = toStringValue(round.id);
            const games = [...(round.duels ?? [])].map((duel) => {
                const sourceGameId = toStringValue(duel.id);
                const homeName = toStringValue(duel.team_1_name, "Mandante");
                const awayName = toStringValue(duel.team_2_name, "Visitante");
                const startsAt = toOptionalString(duel.starts_at_formatted);

                return {
                    id: `placarsoft:${sourceGameId}`,
                    sourceGameId,
                    name: toStringValue(duel.name, sourceGameId),
                    roundId,
                    roundName,
                    roundOrder,
                    matchday,
                    date: parseBrazilDateTime(startsAt) ?? new Date(0),
                    startsAt,
                    location: toStringValue(duel.space_name ?? duel.address, "Local a confirmar"),
                    status: getGameStatus(duel),
                    publicUri: toOptionalString(duel.public_uri),
                    resultName: toOptionalString(duel.result_name),
                    scoreHome: toOptionalNumber(duel.score_1_formatted),
                    scoreAway: toOptionalNumber(duel.score_2_formatted),
                    tiebreakHome: toOptionalNumber(duel.subscore_1_formatted),
                    tiebreakAway: toOptionalNumber(duel.subscore_2_formatted),
                    homeTeam: {
                        sourceTeamId: toOptionalString(duel.t1_team_id),
                        name: homeName,
                        shortName: normalizeShortName(homeName, duel.team_1_shortname),
                        logoUrl: toOptionalString(duel.team_1_shield_thumb_url),
                    },
                    awayTeam: {
                        sourceTeamId: toOptionalString(duel.t2_team_id),
                        name: awayName,
                        shortName: normalizeShortName(awayName, duel.team_2_shortname),
                        logoUrl: toOptionalString(duel.team_2_shield_thumb_url),
                    },
                } satisfies PlacarsoftGame;
            });

            return {
                id: `placarsoft:${roundId}`,
                sourceRoundId: roundId,
                order: roundOrder,
                name: roundName,
                title: formatRoundTitle(matchday, roundName),
                matchday,
                games,
            } satisfies PlacarsoftNormalizedRound;
        })
        .sort((left, right) => {
            const leftMatchday = left.matchday ?? left.order;
            const rightMatchday = right.matchday ?? right.order;

            return leftMatchday - rightMatchday;
        });

    const competition = result.competition;
    const phase = result.phase;
    const updatedAt = response.updated_at?.trim() || null;

    return {
        source,
        sourcePageUrl: source.sourcePageUrl,
        apiBaseUrl: options.apiBaseUrl ?? source.apiBaseUrl,
        group: {
            id: toStringValue(result.id, source.groupId),
            name: toStringValue(result.name, "Grupo"),
        },
        phase: {
            id: toStringValue(phase?.id, source.phaseId),
            name: toStringValue(phase?.name, "Fase"),
        },
        competition: {
            id: toStringValue(competition?.id, source.competitionId),
            name: toStringValue(competition?.name, "Competicao"),
            nickname: toOptionalString(competition?.nickname),
            commonName: toOptionalString(competition?.common_name),
            slug: toOptionalString(competition?.slug),
            publicUri: toOptionalString(competition?.public_uri),
        },
        freshness: {
            updatedAt,
            updatedAtDate: parseBrazilDateTime(updatedAt),
            fetchedAt: options.fetchedAt ?? new Date(),
            currentRoundId: toOptionalString(response.current_round_id),
            cached: Boolean(response.cached),
        },
        standings,
        rounds,
        games: rounds.flatMap((round) => round.games),
    };
}

async function fetchGroupFromBaseUrl(
    source: PlacarsoftCompetitionSource,
    apiBaseUrl: string,
    options: {
        fetcher: PlacarsoftFetch;
        timeoutMs: number;
    },
) {
    const url = `${normalizeApiBaseUrl(apiBaseUrl)}/portal/competitions/groups/${source.groupId}`;
    const response = await fetchJson<PlacarsoftGroupResponse>(url, options);

    return normalizePlacarsoftGroupResponse(response, source, {
        apiBaseUrl: normalizeApiBaseUrl(apiBaseUrl),
    });
}

export async function fetchPlacarsoftCompetitionData(
    source: PlacarsoftCompetitionSource = PIRANGI_FUTSAL_7_DE_MARCO_SOURCE,
    options: {
        fetcher?: PlacarsoftFetch;
        timeoutMs?: number;
    } = {},
) {
    const fetcher = options.fetcher ?? fetch;
    const timeoutMs = options.timeoutMs ?? 8_000;
    const failures: unknown[] = [];

    if (source.apiBaseUrl) {
        try {
            return await fetchGroupFromBaseUrl(source, source.apiBaseUrl, { fetcher, timeoutMs });
        } catch (error) {
            failures.push(error);
        }
    }

    try {
        const discoveredApiBaseUrl = await discoverPlacarsoftApiBaseUrl(source, { fetcher, timeoutMs });

        return await fetchGroupFromBaseUrl(source, discoveredApiBaseUrl, { fetcher, timeoutMs });
    } catch (error) {
        failures.push(error);
    }

    throw new PlacarsoftError("Unable to fetch official Placarsoft competition data", failures);
}
