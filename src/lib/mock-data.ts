import { Player, Match, Statistics } from '../types/database';

export const MOCK_PLAYERS: Player[] = [
  { id: '1', name: 'John Doe', number: 10, position: 'Outside Hitter', team_name: 'Eagles', active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'Jane Smith', number: 5, position: 'Setter', team_name: 'Eagles', active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'Mike Johnson', number: 7, position: 'Middle Blocker', team_name: 'Eagles', active: true, created_at: new Date().toISOString() },
  { id: '4', name: 'Sarah Wilson', number: 12, position: 'Libero', team_name: 'Eagles', active: true, created_at: new Date().toISOString() },
];

export const MOCK_MATCHES: Match[] = [
  { id: 'm1', opponent: 'Hawks', match_date: '2024-05-15', location: 'Main Gym', status: 'completed', home_score: 3, away_score: 1, created_at: new Date().toISOString() },
  { id: 'm2', opponent: 'Wolves', match_date: '2024-05-20', location: 'East Arena', status: 'scheduled', home_score: 0, away_score: 0, created_at: new Date().toISOString() },
];

export const MOCK_STATS: Statistics[] = [
  { id: 's1', player_id: '1', match_id: 'm1', kills: 15, assists: 1, blocks: 2, digs: 8, aces: 3, errors: 4, sets_played: 4, created_at: new Date().toISOString() },
  { id: 's2', player_id: '2', match_id: 'm1', kills: 2, assists: 45, blocks: 1, digs: 12, aces: 1, errors: 2, sets_played: 4, created_at: new Date().toISOString() },
];