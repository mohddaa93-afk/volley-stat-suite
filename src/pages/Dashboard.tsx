import React, { useState, useEffect } from 'react';
import { Plus, Users, Trophy, Star, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MOCK_PLAYERS, MOCK_MATCHES } from '@/lib/mock-data';
import { supabase } from '@/lib/supabase';
import { Player, Match } from '@/types/database';
import { cn } from '@/lib/utils';

export const Dashboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: pData } = await supabase.from('players').select('*');
        const { data: mData } = await supabase.from('matches').select('*').order('match_date', { ascending: false });
        
        if (pData && pData.length > 0) setPlayers(pData);
        else setPlayers(MOCK_PLAYERS);
        
        if (mData && mData.length > 0) setMatches(mData);
        else setMatches(MOCK_MATCHES);
      } catch (error) {
        console.error('Error fetching data:', error);
        setPlayers(MOCK_PLAYERS);
        setMatches(MOCK_MATCHES);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentMatches = matches.slice(0, 3);
  const nextMatch = matches.find(m => m.status === 'scheduled');

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative h-64 md:h-80 rounded-3xl overflow-hidden bg-blue-900 text-white">
        <img 
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/dfcf47f6-24bc-4ce3-9549-d4829d5b6faa/hero-volleyball-action-b5bfabd2-1775638926586.webp" 
          alt="Volleyball Action" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-10 space-y-2">
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none px-3 py-1">2024 Season</Badge>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Eagles Volleyball</h2>
          <p className="text-blue-100 max-w-md text-sm md:text-base">
            Tracking performance, dominating the court. Manage your team's statistics and analyze every play.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card className="md:col-span-2 border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold">Team Overview</CardTitle>
              <CardDescription>Season statistics summary</CardDescription>
            </div>
            <TrendingUp className="text-blue-600" size={20} />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                <p className="text-xs font-medium text-slate-500 mb-1">MATCHES</p>
                <p className="text-2xl font-bold text-slate-900">{matches.length}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                <p className="text-xs font-medium text-slate-500 mb-1">PLAYERS</p>
                <p className="text-2xl font-bold text-slate-900">{players.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl text-center">
                <p className="text-xs font-medium text-green-600 mb-1">WINS</p>
                <p className="text-2xl font-bold text-green-700">{matches.filter(m => m.home_score > m.away_score).length}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl text-center">
                <p className="text-xs font-medium text-blue-600 mb-1">WIN RATE</p>
                <p className="text-2xl font-bold text-blue-700">
                  {matches.length > 0 ? Math.round((matches.filter(m => m.home_score > m.away_score).length / matches.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Match Card */}
        <Card className="border-none shadow-sm bg-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calendar size={18} />
              Next Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextMatch ? (
              <div className="space-y-4">
                <div>
                  <p className="text-blue-100 text-sm">Opponent</p>
                  <p className="text-xl font-bold">vs. {nextMatch.opponent}</p>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-blue-100 text-sm">Date & Time</p>
                    <p className="font-semibold">{new Date(nextMatch.match_date).toLocaleDateString()}</p>
                    <p className="text-xs opacity-80">{nextMatch.location || 'Location TBD'}</p>
                  </div>
                  <Button size="sm" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
                    <Link to={`/matches/${nextMatch.id}`}>Details</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-blue-100 italic">
                No upcoming matches scheduled.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Matches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="text-amber-500" size={22} />
              Recent Results
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/matches" className="text-blue-600 flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentMatches.map((match, idx) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                    match.home_score > match.away_score ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                  )}>
                    {match.home_score}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">vs. {match.opponent}</p>
                    <p className="text-xs text-slate-500">{new Date(match.match_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={match.status === 'completed' ? 'secondary' : 'outline'}>
                    {match.status.toUpperCase()}
                  </Badge>
                  <p className="text-sm font-medium text-slate-600 mt-1">{match.away_score} (Opp)</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top Performers (Mock/Static for UI demonstration) */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Star className="text-yellow-500" size={22} />
            Top Performers
          </h3>
          
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {players.slice(0, 4).map((player, idx) => (
                  <div key={player.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden relative">
                        <img 
                          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/dfcf47f6-24bc-4ce3-9549-d4829d5b6faa/player-placeholder-171c2bf4-1775638926406.webp" 
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{player.name}</p>
                        <p className="text-xs text-slate-500">#{player.number} • {player.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                        <span>{25 - idx * 3} Kills</span>
                      </div>
                      <Progress value={90 - idx * 15} className="h-1.5 w-24 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};