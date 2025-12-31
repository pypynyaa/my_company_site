import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Calendar, User, ChevronLeft, ChevronRight, Quote, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import VideoPlayer from './VideoPlayer';
import PhotoViewer from './PhotoViewer';

export interface MemoryItem {
  id: string;
  type: 'photo' | 'text' | 'video';
  content: string;
  author?: string | null;
  created_at: string;
  telegram_message_id?: number | null;
  telegram_file_id?: string | null;
  media_urls?: string[];
  external_url?: string | null; // Новое поле для Я.Диска
}

const MemoryCard: React.FC<{ memory: MemoryItem; index: number; onDelete?: (id: string) => void }> = ({ memory, index, onDelete }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const allMedia = memory.media_urls || (memory.telegram_file_id ? [memory.telegram_file_id] : []);
  const hasMedia = allMedia.length > 0;

  // Если тип видео, то первый файл в массиве считаем видео, остальные — фото (как превью)
  const isVideoAt = (idx: number) => {
    return memory.type === 'video' && idx === 0;
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onClick={() => setIsExpanded(true)}
        className="relative group bg-[#0A0A0A] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col h-full hover:border-white/10 transition-all duration-500 shadow-2xl cursor-pointer"
      >
        {onDelete && (
          <Button
            variant="ghost" size="icon"
            onClick={(e) => { e.stopPropagation(); onDelete(memory.id); }}
            className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-md text-white/50 hover:text-rose-500 rounded-full h-10 w-10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}

        {hasMedia && (
          <div className="relative aspect-square w-full bg-black overflow-hidden border-b border-white/5">
            <PhotoViewer telegramFileId={allMedia[0]} objectFit="cover" className="w-full h-full" />
            {memory.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                    </div>
                </div>
            )}
            {allMedia.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded text-[10px] text-white z-10 font-bold uppercase tracking-widest">
                +{allMedia.length - 1} FILES
              </div>
            )}
          </div>
        )}

        <div className="p-7">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-3 h-3 text-indigo-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              {new Date(memory.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 italic font-light break-words">
            {memory.content}
          </p>
        </div>
      </motion.div>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-[100vw] sm:max-w-[800px] h-[100dvh] sm:h-auto sm:max-h-[92vh] bg-black border-white/10 p-0 overflow-hidden flex flex-col outline-none shadow-2xl">
          <VisuallyHidden.Root>
            <DialogTitle>Просмотр воспоминания</DialogTitle>
            <DialogDescription>Детальный просмотр медиа и текста</DialogDescription>
          </VisuallyHidden.Root>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
            {hasMedia && (
              <div className="relative w-full bg-[#050505] min-h-[350px] flex items-center justify-center overflow-hidden border-b border-white/5">
                <div className="w-full h-auto max-h-[65vh]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={allMedia[currentMediaIndex]}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      {isVideoAt(currentMediaIndex) ? (
                        <VideoPlayer telegramFileId={allMedia[currentMediaIndex]} className="w-full h-full aspect-video" />
                      ) : (
                        <PhotoViewer 
                          telegramFileId={allMedia[currentMediaIndex]} 
                          objectFit="contain" 
                          className="w-full h-full min-h-[400px] max-h-[65vh]" 
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {allMedia.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(p => p > 0 ? p - 1 : allMedia.length - 1)}}
                      className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/60 backdrop-blur-xl text-white hover:bg-indigo-600 transition-all z-20 border border-white/10">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(p => p < allMedia.length - 1 ? p + 1 : 0)}}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/60 backdrop-blur-xl text-white hover:bg-indigo-600 transition-all z-20 border border-white/10">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="p-8 sm:p-16 space-y-12">
              <div className="flex items-center justify-between border-b border-white/5 pb-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Timestamp</p>
                  <p className="text-white text-xl font-light">
                    {new Date(memory.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                {memory.author && (
                  <div className="text-right space-y-2">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Contributor</p>
                    <p className="text-white text-xl font-light tracking-tight">{memory.author}</p>
                  </div>
                )}
              </div>

              <div className="relative">
                <Quote className="absolute -left-10 -top-6 w-20 h-20 text-white/[0.03] rotate-180 pointer-events-none" />
                <p className="text-slate-100 text-2xl sm:text-3xl leading-[1.7] font-light whitespace-pre-wrap italic break-words tracking-tight">
                  {memory.content}
                </p>
              </div>

              {memory.external_url && (
                <div className="pt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(memory.external_url!, '_blank')}
                    className="w-full h-16 bg-indigo-500/5 border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all gap-4 rounded-2xl text-lg font-bold"
                  >
                    <ExternalLink className="w-6 h-6" />
                    Открыть архив на Яндекс.Диске
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MemoryCard;