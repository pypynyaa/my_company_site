import React, { useState, useEffect } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import YearCard from '@/components/YearCard';
import { Button } from '@/components/ui/button';
import { LogOut, BookOpen, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MemoryCount {
  [key: number]: number;
}

const yearsData = [
  {
    year: 1,
    title: '1 Курс',
    description: 'Начало пути. Время первых открытий и знакомств.',
    isLocked: false,
    color: 'burgundy' as const,
    glow: 'group-hover:bg-rose-900/20',
  },
  {
    year: 2,
    title: '2 Курс',
    description: 'Золотая середина. Приключения и крепкая дружба.',
    isLocked: false,
    color: 'emerald' as const,
    glow: 'group-hover:bg-emerald-900/20',
  },
  {
    year: 3,
    title: '3 Курс',
    description: 'Новые высоты. Мы становимся сильнее.',
    isLocked: true, // ЗАБЛОКИРОВАНО
    color: 'amber' as const,
    glow: 'group-hover:bg-amber-900/20',
  },
  {
    year: 4,
    title: '4 Курс',
    description: 'Финишная прямая. Итоги и мечты.',
    isLocked: true, // ЗАБЛОКИРОВАНО
    color: 'indigo' as const,
    glow: 'group-hover:bg-indigo-900/20',
  },
];

const HomePage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [memoryCounts, setMemoryCounts] = useState<MemoryCount>({});

  useEffect(() => {
    fetchMemoryCounts();
    // Запрещаем скролл на главной странице
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const fetchMemoryCounts = async () => {
    const { data, error } = await supabase.from('memories').select('year_number');
    if (!error && data) {
      const counts: MemoryCount = {};
      data.forEach((memory) => {
        counts[memory.year_number] = (counts[memory.year_number] || 0) + 1;
      });
      setMemoryCounts(counts);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#020202] text-slate-300 overflow-hidden flex flex-col">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-950/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-950/10 rounded-full blur-[120px]" />
      </div>

      {/* Header - фиксированная высота */}
      <header className="h-[70px] shrink-0 z-50 backdrop-blur-xl border-b border-white/5 bg-black/40 flex items-center">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="font-display text-lg font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-500 uppercase">
              Archive
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-100 rounded-full" onClick={() => navigate('/letters')}>
              <Mail className="w-4 h-4 mr-2" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Послания</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-500 rounded-full" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - занимает оставшееся место */}
      <main className="flex-1 flex flex-col relative z-10 px-6 overflow-hidden">
        {/* Hero Section - компактная */}
        <div className="pt-8 pb-4 text-center shrink-0">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-4"
          >
            <ShieldCheck className="w-3 h-3 text-indigo-500" />
            <span className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-500">Authorized Access Only</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter leading-none text-slate-100 mb-2">
            МЫ БЫЛИ <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-600">ЗДЕСЬ</span>
          </h1>
        </div>

        {/* Grid Section - растягивается и подстраивается */}
        <div className="flex-1 flex items-center justify-center pb-8 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl h-full max-h-[600px]">
            <LayoutGroup>
              {yearsData.map((year, idx) => (
                <motion.div
                  key={year.year}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="relative h-full min-h-0"
                >
                  <div 
                    className={`relative h-full overflow-hidden rounded-[2rem] border border-white/5 bg-[#080808] transition-all duration-300 
                      ${year.isLocked ? 'opacity-40 grayscale-[0.5]' : 'hover:border-white/10 hover:bg-[#0c0c0c] hover:shadow-2xl hover:shadow-black'}`}
                    onClick={() => !year.isLocked && navigate(`/year/${year.year}`)}
                  >
                    {/* Приглушенное свечение внутри контейнера во избежание наслоения */}
                    {!year.isLocked && (
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none ${year.glow}`} />
                    )}
                    
                    <YearCard
                      {...year}
                      memoryCount={memoryCounts[year.year] || 0}
                    />
                  </div>
                </motion.div>
              ))}
            </LayoutGroup>
          </div>
        </div>
      </main>

      {/* Footer - минимальный */}
      <footer className="h-[60px] shrink-0 border-t border-white/5 flex items-center justify-center bg-black/20">
        <p className="text-[9px] font-bold tracking-[0.3em] text-slate-700 uppercase">
          Digital Heritage • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default HomePage;