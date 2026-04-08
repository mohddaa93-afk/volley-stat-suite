import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Minus, 
  Activity, 
  User, 
  BarChart2, 
  History,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { MOCK_MATCHES, MOCK_PLAYERS, MOCK_STATS } from '@/lib/mock-data';
import { Match, Player, Statistics } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';

export const MatchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<Statistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tracker');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Match
        const { data: mData } = await supabase.from('matches').select('*').eq('id', id).single();
        if (mData) setMatch(mData);
        else setMatch(MOCK_MATCHES.find(m => m.id === id) || null);

        // Fetch Players
        const { data: pData } = await supabase.from('players').select('*').eq('active', true);
        if (pData && pData.length > 0) setPlayers(pData);
        else setPlayers(MOCK_PLAYERS);

        // Fetch Stats
        const { data: sData } = await supabase.from('statistics').select('*').eq('match_id', id);
        if (sData) setStats(sData);
        else setStats(MOCK_STATS.filter(s => s.match_id === id));
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const updateStat = (playerId: string, category: keyof Statistics, delta: number) => {
    setStats(prev => {
      const existing = prev.find(s => s.player_id === playerId);
      if (existing) {
        return prev.map(s => {
          if (s.player_id === playerId) {
            const newVal = Math.max(0, (s[category] as number) + delta);
            return { ...s, [category]: newVal };
          }
          return s;
        });
      } else {
        const newStat: Statistics = {
          id: Math.random().toString(36).substr(2, 9),
          player_id: playerId,
          match_id: id || '',
          kills: 0,
          assists: 0,
          blocks: 0,
          digs: 0,
          aces: 0,
          errors: 0,
          sets_played: 1,
          created_at: new Date().toISOString(),
        };
        const newVal = Math.max(0, (newStat[category] as number) + delta);
        return [...prev, { ...newStat, [category]: newVal }];
      }
    });
  };

  const handleSaveStats = async () => {
    try {
      toast.promise(
        new Promise(async (resolve, reject) => {
          const { error } = await supabase.from('statistics').upsert(
            stats.map(({ id, created_at, ...rest }) => ({
              ...rest,
              match_id: id || '' 
            })),
            { onConflict: 'player_id,match_id' }
          );
          
          // Small delay for effect
          setTimeout(() => {
            if (error && error.code !== 'PGRST116') reject(error);
            else resolve(true);
          }, 800);
        }),
        {
          loading: 'Saving statistics...',
          success: 'Statistics updated successfully!',
          error: 'Failed to save stats. Data kept locally.',
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const getPlayerStat = (playerId: string) => {
    return stats.find(s => s.player_id === playerId) || {
      kills: 0, assists: 0, blocks: 0, digs: 0, aces: 0, errors: 0, sets_played: 1
    };
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading match data...</div>;
  if (!match) return <div className="text-center py-20">Match not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/matches')} className="rounded-full">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">vs. {match.opponent}</h1>
          <p className="text-slate-500 text-sm">{new Date(match.match_date).toLocaleDateString()} • {match.location}</p>
        </div>
        <div className="ml-auto">
          <Badge className={match.status === 'completed' ? 'bg-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-blue-100 text-blue-700'}>
            {match.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Score Summary */}
        <Card className="lg:col-span-1 border-none shadow-sm bg-slate-900 text-white overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">MATCH SCORE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center py-4">
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-1 font-bold">EAGLES</p>
                <div className="text-5xl font-black tracking-tighter">{match.home_score}</div>
              </div>
              <div className="h-10 w-[1px] bg-slate-800" />
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-1 font-bold truncate max-w-[60px]">{match.opponent.toUpperCase()}</p>
                <div className="text-5xl font-black tracking-tighter">{match.away_score}</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Duration</span>
                <span className="font-medium">1h 45m</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Points</span>
                <span className="font-medium">{stats.reduce((acc, s) => acc + s.kills + s.blocks + s.aces, 0)} pts</span>
              </div>
              <Button 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white border-none"
                onClick={handleSaveStats}
              >
                <Save size={16} className="mr-2" />
                Sync Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interaction Tabs */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="tracker" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-md bg-white border border-slate-100 mb-6">
              <TabsTrigger value="tracker" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Activity size={16} className="mr-2" /> Live Tracker
              </TabsTrigger>
              <TabsTrigger value="summary" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <BarChart2 size={16} className="mr-2" /> Stats Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tracker" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((player) => {
                  const pStat = getPlayerStat(player.id);
                  return (
                    <motion.div key={player.id} layout>
                      <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                {player.number}
                              </div>
                              <span className="font-bold text-slate-800">{player.name}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200">
                              {player.position}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-y-4 gap-x-2">
                            {[
                              { label: 'Kills', key: 'kills' },
                              { label: 'Aces', key: 'aces' },
                              { label: 'Blocks', key: 'blocks' },
                              { label: 'Digs', key: 'digs' },
                              { label: 'Assists', key: 'assists' },
                              { label: 'Errors', key: 'errors', isRed: true },
                            ].map((stat) => (
                              <div key={stat.key} className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">{stat.label}</span>
                                <div className="flex items-center bg-slate-50 rounded-lg p-1 w-full justify-between">
                                  <button 
                                    onClick={() => updateStat(player.id, stat.key as any, -1)}
                                    className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className={cn("font-bold text-sm", stat.isRed && (pStat as any)[stat.key] > 0 ? "text-red-600" : "text-slate-700")}>
                                    {(pStat as any)[stat.key]}
                                  </span>
                                  <button 
                                    onClick={() => updateStat(player.id, stat.key as any, 1)}
                                    className="w-6 h-6 flex items-center justify-center text-blue-500 hover:text-blue-700 active:scale-90"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="summary" className="mt-0">
              <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold">Player</TableHead>
                      <TableHead className="text-center font-bold">Kills</TableHead>
                      <TableHead className="text-center font-bold">Aces</TableHead>
                      <TableHead className="text-center font-bold">Blocks</TableHead>
                      <TableHead className="text-center font-bold">Digs</TableHead>
                      <TableHead className="text-center font-bold">Assists</TableHead>
                      <TableHead className="text-center font-bold text-red-500">Err</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map((player) => {
                      const pStat = getPlayerStat(player.id);
                      return (
                        <TableRow key={player.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 w-4 font-mono text-xs">{player.number}</span>
                              {player.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-blue-600">{pStat.kills}</TableCell>
                          <TableCell className="text-center">{pStat.aces}</TableCell>
                          <TableCell className="text-center">{pStat.blocks}</TableCell>
                          <TableCell className="text-center">{pStat.digs}</TableCell>
                          <TableCell className="text-center">{pStat.assists}</TableCell>
                          <TableCell className="text-center text-red-400">{pStat.errors}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');