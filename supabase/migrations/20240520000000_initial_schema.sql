-- Volleyball Statistics App Initial Schema
-- Generated at: 2024-05-20

-- Create players table
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    number INTEGER,
    position TEXT,
    team_name TEXT,
    active BOOLEAN DEFAULT true
);

-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    opponent TEXT NOT NULL,
    match_date DATE DEFAULT CURRENT_DATE NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed')),
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0
);

-- Create statistics table
CREATE TABLE IF NOT EXISTS public.statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    kills INTEGER DEFAULT 0 NOT NULL,
    assists INTEGER DEFAULT 0 NOT NULL,
    blocks INTEGER DEFAULT 0 NOT NULL,
    digs INTEGER DEFAULT 0 NOT NULL,
    aces INTEGER DEFAULT 0 NOT NULL,
    errors INTEGER DEFAULT 0 NOT NULL,
    sets_played INTEGER DEFAULT 1 NOT NULL,
    UNIQUE(player_id, match_id)
);

-- View for player statistics totals
CREATE OR REPLACE VIEW public.player_totals AS
SELECT 
    p.id as player_id,
    p.name,
    p.number,
    p.position,
    p.team_name,
    count(s.match_id) as matches_played,
    sum(COALESCE(s.kills, 0)) as total_kills,
    sum(COALESCE(s.assists, 0)) as total_assists,
    sum(COALESCE(s.blocks, 0)) as total_blocks,
    sum(COALESCE(s.digs, 0)) as total_digs,
    sum(COALESCE(s.aces, 0)) as total_aces,
    sum(COALESCE(s.errors, 0)) as total_errors,
    sum(COALESCE(s.kills, 0) + COALESCE(s.blocks, 0) + COALESCE(s.aces, 0)) as total_points
FROM 
    public.players p
LEFT JOIN 
    public.statistics s ON p.id = s.player_id
GROUP BY 
    p.id;

-- Enable Row Level Security
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Players Policies
CREATE POLICY "Allow public read access on players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on players" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on players" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on players" ON public.players FOR DELETE USING (true);

-- Matches Policies
CREATE POLICY "Allow public read access on matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on matches" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on matches" ON public.matches FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on matches" ON public.matches FOR DELETE USING (true);

-- Statistics Policies
CREATE POLICY "Allow public read access on statistics" ON public.statistics FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on statistics" ON public.statistics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on statistics" ON public.statistics FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on statistics" ON public.statistics FOR DELETE USING (true);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_statistics_player_id ON public.statistics(player_id);
CREATE INDEX IF NOT EXISTS idx_statistics_match_id ON public.statistics(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date);