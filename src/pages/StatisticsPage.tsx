import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, Share2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { MOCK_PLAYERS, MOCK_STATS } from '@/lib/mock-data';
import { PlayerStats } from '@/types/database';

export const StatisticsPage: React.FC = () => {
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('player_totals').select('*');
        if (data && data.length > 0) {
          setPlayerStats(data as PlayerStats[]);
        } else {
          // Generate mock totals from MOCK_STATS and MOCK_PLAYERS
          const mockTotals = MOCK_PLAYERS.map(p => {
            const pStats = MOCK_STATS.filter(s => s.player_id === p.id);
            return {
              player_id: p.id,
              name: p.name,
              number: p.number,
              position: p.position,
              team_name: p.team_name,
              matches_played: pStats.length,
              total_kills: pStats.reduce((acc, s) => acc + s.kills, 0),
              total_assists: pStats.reduce((acc, s) => acc + s.assists, 0),
              total_blocks: pStats.reduce((acc, s) => acc + s.blocks, 0),
              total_digs: pStats.reduce((acc, s) => acc + s.digs, 0),
              total_aces: pStats.reduce((acc, s) => acc + s.aces, 0),
              total_errors: pStats.reduce((acc, s) => acc + s.errors, 0),
              total_points: pStats.reduce((acc, s) => acc + s.kills + s.blocks + s.aces, 0),
            };
          });
          setPlayerStats(mockTotals as PlayerStats[]);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = playerStats
    .sort((a, b) => b.total_kills - a.total_kills)
    .slice(0, 6)
    .map(p => ({
      name: p.name.split(' ')[0],
      kills: p.total_kills,
      blocks: p.total_blocks,
      aces: p.total_aces
    }));

  const COLORS = ['#2563eb', '#4f46e5', '#7c3aed', '#db2777', '#ea580c', '#ca8a04'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-500">Comprehensive season-wide performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-white">
            <Download size={18} />
            Export CSV
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Share2 size={18} />
            Share Report
          </Button>
        </div>
      </div>

      {/* High Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Top Scorer', value: playerStats[0]?.name || '---', sub: `${playerStats[0]?.total_kills || 0} Kills`, color: 'blue' },
          { label: 'Ace Specialist', value: playerStats.sort((a,b) => b.total_aces - a.total_aces)[0]?.name || '---', sub: `${playerStats.sort((a,b) => b.total_aces - a.total_aces)[0]?.total_aces || 0} Aces`, color: 'purple' },
          { label: 'The Wall', value: playerStats.sort((a,b) => b.total_blocks - a.total_blocks)[0]?.name || '---', sub: `${playerStats.sort((a,b) => b.total_blocks - a.total_blocks)[0]?.total_blocks || 0} Blocks`, color: 'indigo' },
          { label: 'Assist Leader', value: playerStats.sort((a,b) => b.total_assists - a.total_assists)[0]?.name || '---', sub: `${playerStats.sort((a,b) => b.total_assists - a.total_assists)[0]?.total_assists || 0} Assists`, color: 'orange' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-900 truncate">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-600 mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Offensive Leaders</CardTitle>
            <CardDescription>Comparison of points by player</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="kills" fill="#2563eb" radius={[4, 4, 0, 0]} name="Kills" />
                <Bar dataKey="blocks" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Blocks" />
                <Bar dataKey="aces" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Aces" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Efficiency Chart */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Points Breakdown</CardTitle>
            <CardDescription>Overall scoring distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Kills', value: playerStats.reduce((acc, p) => acc + p.total_kills, 0) },
                      { name: 'Blocks', value: playerStats.reduce((acc, p) => acc + p.total_blocks, 0) },
                      { name: 'Aces', value: playerStats.reduce((acc, p) => acc + p.total_aces, 0) },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[0,1,2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900">
                  {playerStats.reduce((acc, p) => acc + p.total_points, 0)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Pts</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};