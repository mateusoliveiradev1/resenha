import type { MatchPresentation } from "@resenha/db";
import type { MatchResult } from "@/components/home/LatestResults";
import type { NextMatch } from "@/components/home/NextMatchBanner";
import type { Match } from "@/components/jogos/MatchCard";

function getPerspectiveScores(match: MatchPresentation) {
    return {
        scoreHome: match.isResenhaHome ? match.scoreHome : match.scoreAway,
        scoreAway: match.isResenhaHome ? match.scoreAway : match.scoreHome,
        tiebreakHome: match.isResenhaHome ? match.tiebreakHome : match.tiebreakAway,
        tiebreakAway: match.isResenhaHome ? match.tiebreakAway : match.tiebreakHome,
    };
}

export function toDisplayMatch(
    match: MatchPresentation,
    options: {
        perspective?: "RESHENHA" | "FIXTURE";
    } = {}
): Match {
    const perspective = options.perspective ?? "RESHENHA";
    const scores =
        perspective === "FIXTURE"
            ? {
                scoreHome: match.scoreHome,
                scoreAway: match.scoreAway,
                tiebreakHome: match.tiebreakHome,
                tiebreakAway: match.tiebreakAway,
            }
            : getPerspectiveScores(match);

    return {
        id: match.id,
        opponent: perspective === "FIXTURE" ? match.awayTeam.name : match.opponentName,
        opponentLogo: perspective === "FIXTURE" ? match.awayTeam.logoUrl : match.opponentLogo,
        homeTeamName: perspective === "FIXTURE" ? match.homeTeam.name : undefined,
        homeTeamLogo: perspective === "FIXTURE" ? match.homeTeam.logoUrl : undefined,
        date: match.date,
        location: match.location,
        type: match.type,
        matchday: match.matchday,
        status: match.status,
        scoreHome: scores.scoreHome,
        scoreAway: scores.scoreAway,
        tiebreakHome: scores.tiebreakHome,
        tiebreakAway: scores.tiebreakAway,
        competitionName: match.competitionName,
        phaseLabel: match.phaseLabel,
        roundLabel: match.roundLabel,
        displayMode: perspective,
    };
}

export function toNextMatch(match: MatchPresentation): NextMatch {
    const { scoreHome, scoreAway } = getPerspectiveScores(match);

    return {
        opponent: match.opponentName,
        opponentLogo: match.opponentLogo,
        date: match.date,
        location: match.location,
        type: match.type,
        season: match.competitionName,
        status: match.status,
        scoreHome,
        scoreAway,
        tiebreakHome: match.isResenhaHome ? match.tiebreakHome : match.tiebreakAway,
        tiebreakAway: match.isResenhaHome ? match.tiebreakAway : match.tiebreakHome,
    };
}

export function toLatestResult(match: MatchPresentation): MatchResult {
    const { scoreHome, scoreAway, tiebreakHome, tiebreakAway } = getPerspectiveScores(match);

    return {
        id: match.id,
        opponent: match.opponentName,
        opponentLogo: match.opponentLogo,
        date: match.date,
        scoreHome: scoreHome ?? 0,
        scoreAway: scoreAway ?? 0,
        tiebreakHome: tiebreakHome ?? null,
        tiebreakAway: tiebreakAway ?? null,
        competitionName: match.competitionName,
    };
}
