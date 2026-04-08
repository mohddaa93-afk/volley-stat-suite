export type Player = {
  id: string;
  created_at?: string;
  name: string;
  number: number | null;
  position: string | null;
  team_name: string | null;
  active: boolean;
};

export type Match = {
  id: string;
  created_at?: string;
  opponent: string;
  match_date: string;
  location: string | null;
  status: 'scheduled' | 'ongoing' | 'completed';
  home_score: number;
  away_score: number;
};

export type Statistics = {
  id?: string;
  created_at?: string;
  player_id: string;
  match_id: string;
  kills: number;
  assists: number;
  blocks: number;
  digs: number;
  aces: number;
  errors: number;
  sets_played: number;
};

export type PlayerStats = {
  player_id: string;
  name: string;
  number: number | null;
  position: string | null;
  team_name: string | null;
  matches_played: number;
  total_kills: number;
  total_assists: number;
  total_blocks: number;
  total_digs: number;
  total_aces: number;
  total_errors: number;
  total_points: number;
};