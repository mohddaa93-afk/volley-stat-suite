import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Dashboard } from '@/pages/Dashboard';
import { PlayersPage } from '@/pages/PlayersPage';
import { MatchesPage } from '@/pages/MatchesPage';
import { MatchDetails } from '@/pages/MatchDetails';
import { StatisticsPage } from '@/pages/StatisticsPage';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="matches/:id" element={<MatchDetails />} />
          <Route path="statistics" element={<StatisticsPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" closeButton richColors />
    </BrowserRouter>
  );
}

export default App;