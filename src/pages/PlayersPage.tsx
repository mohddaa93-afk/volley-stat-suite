import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, UserPlus, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { MOCK_PLAYERS } from '@/lib/mock-data';
import { Player } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';

export const PlayersPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    number: '',
    position: '',
    team_name: 'Eagles'
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('players').select('*').order('name');
      if (error) throw error;
      if (data && data.length > 0) setPlayers(data);
      else setPlayers(MOCK_PLAYERS);
    } catch (error) {
      console.error('Error fetching players:', error);
      setPlayers(MOCK_PLAYERS);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayer.name) return;

    try {
      const { data, error } = await supabase.from('players').insert([
        { 
          name: newPlayer.name, 
          number: parseInt(newPlayer.number) || null, 
          position: newPlayer.position,
          team_name: newPlayer.team_name,
          active: true
        }
      ]).select();

      if (error) throw error;
      
      if (data) {
        setPlayers([...players, data[0]]);
        toast.success(`${newPlayer.name} added to the roster!`);
      } else {
        // Mock fallback
        const mockNew: Player = {
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          name: newPlayer.name,
          number: parseInt(newPlayer.number) || null,
          position: newPlayer.position,
          team_name: newPlayer.team_name,
          active: true
        };
        setPlayers([...players, mockNew]);
        toast.info(`${newPlayer.name} added to roster (Preview Mode)`);
      }

      setIsAddModalOpen(false);
      setNewPlayer({ name: '', number: '', position: '', team_name: 'Eagles' });
    } catch (error) {
      toast.error('Failed to add player');
      console.error(error);
    }
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const positions = ['Outside Hitter', 'Opposite Hitter', 'Setter', 'Middle Blocker', 'Libero', 'Defensive Specialist'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Roster Management</h1>
          <p className="text-slate-500">Manage your team players and positions</p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md">
              <UserPlus size={18} />
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Player</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPlayer} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={newPlayer.name} 
                  onChange={e => setNewPlayer({...newPlayer, name: e.target.value})}
                  placeholder="e.g. John Doe" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Jersey #</Label>
                  <Input 
                    id="number" 
                    type="number"
                    value={newPlayer.number} 
                    onChange={e => setNewPlayer({...newPlayer, number: e.target.value})}
                    placeholder="10" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select 
                    value={newPlayer.position} 
                    onValueChange={val => setNewPlayer({...newPlayer, position: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Player</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search players by name or position..." 
            className="pl-10 bg-white border-slate-200"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 bg-white">
          <Filter size={18} />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPlayers.map((player, idx) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-0">
                  <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                    <div className="absolute -bottom-6 left-6">
                      <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg">
                        <img 
                          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/dfcf47f6-24bc-4ce3-9549-d4829d5b6faa/player-placeholder-171c2bf4-1775638926406.webp" 
                          alt={player.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-10 px-6 pb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{player.name}</h3>
                        <p className="text-sm font-medium text-slate-500">{player.position || 'Unknown Position'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-blue-600">#{player.number || '0'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                      <Badge variant={player.active ? 'secondary' : 'outline'} className={player.active ? 'bg-green-50 text-green-700 hover:bg-green-100 border-none' : ''}>
                        {player.active ? 'Active' : 'Inactive'}
                      </Badge>
                      
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                          <Edit2 size={16} />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-red-600 flex gap-2">
                              <Trash2 size={16} /> Delete Player
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Users className="text-slate-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No players found</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your search or add a new player to the roster.</p>
        </div>
      )}
    </div>
  );
};