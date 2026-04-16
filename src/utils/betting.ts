import type { Club, Match } from "../types/football";

export type BetOutcome = "home" | "draw" | "away";

export interface MatchOdds {
  home: number;
  draw: number;
  away: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getMatchOdds(match: Match, clubs: Club[]): MatchOdds {
  const homeClub = clubs.find((club) => club.id === match.homeClubId);
  const awayClub = clubs.find((club) => club.id === match.awayClubId);

  const homeRating = homeClub?.rating ?? 84;
  const awayRating = awayClub?.rating ?? 84;
  const diff = homeRating - awayRating;

  const homeProbability = clamp(0.46 + diff * 0.015, 0.2, 0.68);
  const drawProbability = clamp(0.26 - Math.abs(diff) * 0.006, 0.14, 0.3);
  const awayProbability = clamp(1 - homeProbability - drawProbability, 0.18, 0.64);

  const normalizedTotal = homeProbability + drawProbability + awayProbability;
  const margin = 1.08;

  const toOdds = (probability: number) =>
    Number((margin / (probability / normalizedTotal)).toFixed(2));

  return {
    home: toOdds(homeProbability),
    draw: toOdds(drawProbability),
    away: toOdds(awayProbability),
  };
}

export function getOutcomeLabel(outcome: BetOutcome) {
  switch (outcome) {
    case "home":
      return "П1";
    case "draw":
      return "Х";
    case "away":
      return "П2";
  }
}
