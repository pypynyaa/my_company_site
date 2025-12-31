import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Send, Clock, User, Calendar as CalendarIcon, Sparkles, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Letter {
  id: string;
  message: string;
  recipient: string;
  sender?: string | null;
  created_at: string;
  scheduled_for?: string | null;
  is_delivered: boolean;
}

const LettersPage: React.FC = () => {
  const navigate = useNavigate();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('себе');
  const [sender, setSender] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLetters();
    const interval = setInterval(checkScheduledLetters, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLetters = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setLetters(data as Letter[] || []);
    setIsLoading(false);
  };

  const checkScheduledLetters = async () => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('is_delivered', false)
      .not('scheduled_for', 'is', null)
      .lte('scheduled_for', now);

    if (!error && data && data.length > 0) {
      for (const letter of data) {
        await supabase.from('letters').update({ is_delivered: true }).eq('id', letter.id);
      }
      fetchLetters();
      toast.success(data.length === 1 ? 'Пришло новое письмо из прошлого!' : 'Доставлено несколько писем!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const letterData = {
        message,
        recipient: recipient.toLowerCase() === 'себе' ? 'себе' : recipient,
        sender: sender || null,
        is_delivered: !scheduledFor || new Date(scheduledFor) <= new Date(),
        scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
      };

      const { error } = await supabase.from('letters').insert(letterData);
      if (error) throw error;

      toast.success('Письмо доверено вечности');
      fetchLetters();
      handleCloseModal();
    } catch (error: any) {
      toast.error('Ошибка при отправке');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMessage('');
    setRecipient('себе');
    setSender('');
    setScheduledFor('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredLetters = letters.filter(l => l.is_delivered);
  const scheduledLetters = letters.filter(l => !l.is_delivered);

  return (
    <div className="min-h-screen bg-[#030303] text-slate-300 selection:bg-primary/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5 bg-black/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-white/5 text-slate-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <h1 className="font-display text-lg font-bold tracking-tight text-white hidden sm:block">
                ПОЧТА ВРЕМЕНИ
              </h1>
            </div>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all"
          >
            <Send className="w-4 h-4 mr-2" />
            Написать
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        {/* Scheduled Section */}
        {scheduledLetters.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">В пути через время</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledLetters.map((letter) => (
                <div key={letter.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                    <Ghost className="w-4 h-4 text-slate-500 group-hover:text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium italic">Для {letter.recipient}</p>
                    <p className="text-[10px] text-primary/70 mt-0.5">{formatDate(letter.scheduled_for!)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Letters Grid */}
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-5 h-5 text-yellow-500/50" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Архив посланий</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-white/[0.02] animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredLetters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLetters.map((letter, index) => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedLetter(letter)}
                className="group relative cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-xl" />
                <div className="relative p-6 rounded-3xl bg-[#0A0A0A] border border-white/5 group-hover:border-white/20 transition-all h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400">
                        {letter.recipient.toUpperCase()}
                      </div>
                      <Mail className="w-4 h-4 text-slate-600 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-slate-300 font-light leading-relaxed line-clamp-4 mb-6 italic">
                      "{letter.message}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] text-slate-600">{formatDate(letter.created_at)}</span>
                    {letter.sender && (
                      <span className="text-[10px] font-medium text-primary">от {letter.sender}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[40px]">
            <Ghost className="w-12 h-12 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-500 font-display">Пока ни одного послания не было найдено...</p>
          </div>
        )}
      </main>

      {/* Write Letter Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-slate-200 sm:max-w-[550px] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold text-white">Новое послание</DialogTitle>
            <DialogDescription className="text-slate-500">Оставьте след в истории или напишите себе в будущее.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-500">Кому</Label>
                <Input 
                  value={recipient} 
                  onChange={(e) => setRecipient(e.target.value)} 
                  className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" 
                  placeholder="Имя или 'себе'" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-500">От кого</Label>
                <Input 
                  value={sender} 
                  onChange={(e) => setSender(e.target.value)} 
                  className="bg-white/5 border-white/10 focus:border-primary/50 transition-all" 
                  placeholder="Анонимно" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-500">Текст письма</Label>
              <Textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                className="bg-white/5 border-white/10 focus:border-primary/50 min-h-[120px] resize-none" 
                placeholder="Твои мысли сегодня..." 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Дата доставки
              </Label>
              <Input 
                type="datetime-local" 
                value={scheduledFor} 
                onChange={(e) => setScheduledFor(e.target.value)} 
                className="bg-white/5 border-white/10 focus:border-primary/50 h-10" 
                min={new Date().toISOString().slice(0, 16)} 
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={handleCloseModal} className="text-slate-500">Отмена</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary text-white px-8">
                {isSubmitting ? 'Шифрование...' : 'Отправить сквозь время'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Letter Modal */}
      <Dialog open={!!selectedLetter} onOpenChange={() => setSelectedLetter(null)}>
        <DialogContent className="bg-[#050505] border-white/10 text-slate-200 sm:max-w-[500px]">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <DialogTitle className="text-xl font-display font-bold">Для {selectedLetter?.recipient}</DialogTitle>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
              Отправлено {selectedLetter && formatDate(selectedLetter.created_at)}
            </div>
          </DialogHeader>
          <div className="relative z-10 mt-6 p-6 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
            <p className="text-lg font-light leading-relaxed text-slate-200 italic">
              "{selectedLetter?.message}"
            </p>
          </div>
          {selectedLetter?.sender && (
            <div className="mt-4 text-right text-sm font-medium text-primary">
              — {selectedLetter.sender}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LettersPage;