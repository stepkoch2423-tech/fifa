export type Position =
  | "GK"
  | "CB"
  | "LB"
  | "RB"
  | "CDM"
  | "CM"
  | "CAM"
  | "LW"
  | "RW"
  | "ST";

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface Player extends PlayerStats {
  id: string;
  name: string;
  age: number;
  nationality: string;
  overall: number;
  potential: number;
  position: Position;
  clubId: string;
  kitNumber: number;
  preferredFoot: "Left" | "Right" | "Both";
  heightCm: number;
  weightKg: number;
  photoUrl: string;
  value: string;
  form: string;
  season: {
    appearances: number;
    goals: number;
    assists: number;
    cleanSheets?: number;
  };
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  country: string;
  league: string;
  rating: number;
  attackRating: number;
  midfieldRating: number;
  defenceRating: number;
  stadium: string;
  founded: number;
  identity: string;
  form: string;
  colors: {
    start: string;
    end: string;
    accent: string;
    text: string;
    mutedText: string;
  };
}

export type MatchStatus = "Scheduled" | "Live" | "Finished";

export interface MatchEvent {
  minute: number;
  type: "Goal" | "Yellow Card" | "Red Card" | "Substitution";
  playerId: string;
  description?: string;
}

export interface LineupEntry {
  playerId: string;
  position: Position;
}

export interface MatchLineup {
  clubId: string;
  formation: string;
  players: LineupEntry[];
}

export interface Match {
  id: string;
  homeClubId: string;
  awayClubId: string;
  competition: string;
  round: string;
  status: MatchStatus;
  date: string;
  stadium: string;
  broadcast: string;
  previewUrl: string;
  headline: string;
  homeGoals: number;
  awayGoals: number;
  events: MatchEvent[];
  lineups: MatchLineup[];
  stats: {
    homePossession: number;
    awayPossession: number;
    homeShots: number;
    awayShots: number;
    homeOnTarget: number;
    awayOnTarget: number;
  };
}
