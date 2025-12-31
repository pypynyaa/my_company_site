import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Heart, Sparkles, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MemoryCard, { MemoryItem } from '@/components/MemoryCard';
import AddMemoryModal from '@/components/AddMemoryModal';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const yearInfo: Record<number, { title: string; color: string; accent: string; btn: string }> = {
  1: { title: 'Первый Курс', color: 'from-rose-950/40', accent: 'text-rose-500', btn: 'bg-rose-600 hover:bg-rose-500' },
  2: { title: 'Второй Курс', color: 'from-emerald-950/40', accent: 'text-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-500' },
  3: { title: 'Третий Курс', color: 'from-amber-950/30', accent: 'text-amber-500', btn: 'bg-amber-600 hover:bg-amber-500' },
  4: { title: 'Четвертый Курс', color: 'from-indigo-950/40', accent: 'text-indigo-500', btn: 'bg-indigo-600 hover:bg-indigo-500' },
};

const YearPage: React.FC = () => {
  const { year } = useParams<{ year: string }>();
  const navigate = useNavigate();
  const yearNum = parseInt(year || '1', 10);
  
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const info = yearInfo[yearNum] || { title: `${yearNum} Курс`, color: 'from-slate-900/40', accent: 'text-slate-400', btn: 'bg-slate-700' };

  const fetchMemories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('year_number', yearNum)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setMemories(data as MemoryItem[]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [yearNum]);

  useEffect(() => {
    fetchMemories();
    if (isSupabaseConfigured) {
      const channel = supabase.channel(`memories-year-${yearNum}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'memories', 
          filter: `year_number=eq.${yearNum}` 
        }, () => fetchMemories())
        .subscribe();
      
      return () => { supabase.removeChannel(channel); };
    }
    return () => {};
  }, [yearNum, fetchMemories]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (!error) {
        toast.success('Запись удалена');
        setMemories(prev => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      toast.error('Ошибка удаления');
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-slate-300 selection:bg-indigo-500/30">
      <div className={`fixed inset-0 bg-gradient-to-b ${info.color} to-[#020202] pointer-events-none opacity-60`} />
      
      <header className="relative pt-12 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="group mb-12 text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all rounded-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Архив лет
            </Button>
          </motion.div>

          <div className="relative">
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.03, scale: 1 }}
              className="absolute -top-24 left-1/2 -translate-x-1/2 font-black text-[18rem] md:text-[22rem] leading-none pointer-events-none select-none text-slate-100 italic tracking-tighter"
            >
              {yearNum}
            </motion.span>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center relative pt-10"
            >
              <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter text-slate-100 mb-6 uppercase">
                {info.title.split(' ')[0]} <span className={info.accent}>{info.title.split(' ')[1]}</span>
              </h1>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-slate-800" />
                <p className="font-medium text-xs uppercase tracking-[0.4em] text-slate-500">
                  {memories.length} моментов в этой главе
                </p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-slate-800" />
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Очищенная контрольная панель */}
      <div className="sticky top-6 z-50 container mx-auto px-4">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-fit mx-auto p-2 rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/5 shadow-2xl flex items-center gap-4 px-4"
        >
          <div className="flex items-center gap-2 px-2 text-slate-400">
            <LayoutGrid className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Лента моментов</span>
          </div>
          
          <div className="w-px h-6 bg-white/5" />
          
          <Button
            onClick={() => setIsModalOpen(true)}
            className={`rounded-xl shadow-lg transition-all active:scale-95 border-none text-white font-bold tracking-wide px-8 ${info.btn}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить момент
          </Button>
        </motion.div>
      </div>

      <main className="container mx-auto px-4 py-20 min-h-[60vh]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className={`w-10 h-10 border-2 ${info.accent.replace('text', 'border')} border-t-transparent rounded-full animate-spin`} />
            <p className="text-slate-600 animate-pulse text-[10px] uppercase tracking-[0.3em] font-bold">Синхронизация архива</p>
          </div>
        ) : memories.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {memories.map((memory, index) => (
                <motion.div
                  key={memory.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <MemoryCard memory={memory} index={index} onDelete={handleDelete} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-40 flex flex-col items-center">
            <div className="w-20 h-20 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 rotate-12">
              <Sparkles className="w-8 h-8 text-slate-800" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-3 tracking-tight">Глава ждет своего автора</h3>
            <p className="text-slate-600 max-w-[240px] mx-auto mb-10 text-sm leading-relaxed">
              Здесь будут ваши общие фото, видео и истории. Начните историю этого курса первым.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className={`rounded-full px-10 py-6 h-auto text-sm font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 ${info.btn}`}
            >
              Запечатлеть первый момент
            </Button>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-20 bg-black/40 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex flex-col items-center gap-4">
            <Heart className={`w-5 h-5 ${info.accent} opacity-50`} />
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-700">
              Made with love for the crew
            </span>
          </div>
        </div>
      </footer>

      <AddMemoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        yearNumber={yearNum}
        onMemoryAdded={fetchMemories}
      />
    </div>
  );
};

export default YearPage;