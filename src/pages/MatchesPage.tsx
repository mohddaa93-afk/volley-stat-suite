import React, { useState, useEffect } from 'react';
import { Plus, Trophy, Calendar, MapPin, CheckCircle2, Timer, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { MOCK_MATCHES } from '@/lib/mock-data';
import { Match } from '@/types/database';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newMatch, setNewMatch] = useState({
    opponent: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });
      
      if (error) throw error;
      if (data && data.length > 0) setMatches(data);
      else setMatches(MOCK_MATCHES);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMatches(MOCK_MATCHES);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatch.opponent) return;

    try {
      const { data, error } = await supabase.from('matches').insert([
        { 
          opponent: newMatch.opponent, 
          match_date: newMatch.date, 
          location: newMatch.location,
          status: 'scheduled',
          home_score: 0,
          away_score: 0
        }
      ]).select();

      if (error) throw error;
      
      if (data) {
        setMatches([data[0], ...matches]);
        toast.success(`Match vs ${newMatch.opponent} scheduled!`);
      } else {
        // Mock fallback
        const mockNew: Match = {
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          opponent: newMatch.opponent,
          match_date: newMatch.date,
          location: newMatch.location,
          status: 'scheduled',
          home_score: 0,
          away_score: 0
        };
        setMatches([mockNew, ...matches]);
        toast.info(`Match scheduled (Preview Mode)`);
      }

      setIsAddModalOpen(false);
      setNewMatch({ opponent: '', date: new Date().toISOString().split('T')[0], location: '' });
    } catch (error) {
      toast.error('Failed to schedule match');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:items-start md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Match Schedule</h1>
          <p className="text-slate-500">View upcoming and past matches</p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md">
              <Plus size={18} />
              Schedule Match
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Match</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMatch} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="opponent">Opponent Name</Label>
                <Input 
                  id="opponent" 
                  value={newMatch.opponent} 
                  onChange={e => setNewMatch({...newMatch, opponent: e.target.value})}
                  placeholder="e.g. Rival Team" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Match Date</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={newMatch.date} 
                  onChange={e => setNewMatch({...newMatch, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={newMatch.location} 
                  onChange={e => setNewMatch({...newMatch, location: e.target.value})}
                  placeholder="Home Gym, Away Arena, etc." 
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Schedule Match</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        {/* Match Categories */}
        {['scheduled', 'ongoing', 'completed'].map((status) => {
          const filtered = matches.filter(m => m.status === status);
          if (filtered.length === 0) return null;

          return (
            <section key={status} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-2 h-6 rounded-full",
                  status === 'completed' ? "bg-slate-300" : 
                  status === 'ongoing' ? "bg-green-500" : "bg-blue-500"
                )} />
                <h2 className="text-xl font-bold capitalize text-slate-800">{status}</h2>
                <Badge variant="outline" className="text-slate-500 border-slate-200">
                  {filtered.length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((match) => (
                  <motion.div
                    key={match.id}
                    layoutId={match.id}
                    whileHover={{ y: -4 }}
                  >
                    <Link to={`/matches/${match.id}`}>
                      <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-sm overflow-hidden group">
                        <CardHeader className={cn(
                          "pb-4 text-white",
                          status === 'completed' 
                            ? (match.home_score > match.away_score ? "bg-green-600" : "bg-slate-700") 
                            : status === 'ongoing' ? "bg-orange-500 animate-pulse" : "bg-blue-600"
                        )}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                              {status === 'completed' ? 'Final Score' : 'Upcoming'}
                            </span>
                            {status === 'completed' && match.home_score > match.away_score && (
                              <Badge className="bg-white/20 text-white border-none">WIN</Badge>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-center">
                              <p className="text-xs opacity-70">EAGLES</p>
                              <p className="text-3xl font-black">{match.home_score}</p>
                            </div>
                            <div className="text-xl font-bold opacity-40">VS</div>
                            <div className="text-center">
                              <p className="text-xs opacity-70 truncate max-w-[80px]">{match.opponent.toUpperCase()}</p>
                              <p className="text-3xl font-black">{match.away_score}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 bg-white">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar size={14} className="text-slate-400" />
                              {new Date(match.match_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin size={14} className="text-slate-400" />
                              <span className="truncate">{match.location || 'Location TBD'}</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-xs font-bold text-blue-600 group-hover:underline">TRACK STATISTICS</span>
                            <ChevronRight size={16} className="text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');