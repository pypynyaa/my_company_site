import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Film, User, Paperclip, Calendar as CalendarIcon, Link as LinkIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { uploadToTelegram } from '@/lib/telegram';
import { toast } from 'sonner';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  yearNumber: number;
  onMemoryAdded: () => void;
}

const AddMemoryModal: React.FC<AddMemoryModalProps> = ({ isOpen, onClose, yearNumber, onMemoryAdded }) => {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [externalUrl, setExternalUrl] = useState(''); // Ссылка на Я.Диск
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 10) {
        toast.error('Лимит 10 файлов');
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && files.length === 0 && !externalUrl) return;
    
    setIsUploading(true);
    try {
      let fileIds: string[] = [];
      let telegramMessageId = null;

      if (files.length > 0) {
        const telegramResult = await uploadToTelegram(content, files, author);
        if (!telegramResult.success) throw new Error(telegramResult.error);
        fileIds = telegramResult.fileIds || [];
        telegramMessageId = telegramResult.messageId;
      }

      // Определяем тип: если есть видео в файлах — ставим video
      const hasVideo = files.some(f => f.type.startsWith('video/'));
      const type = hasVideo ? 'video' : (files.length > 0 ? 'photo' : 'text');

      const { error: insertError } = await supabase.from('memories').insert({
        type,
        content,
        author: author || null,
        external_url: externalUrl || null,
        year_number: yearNumber,
        created_at: new Date(`${date}T${new Date().toLocaleTimeString('en-GB')}`).toISOString(),
        telegram_message_id: telegramMessageId,
        media_urls: fileIds
      });

      if (insertError) throw insertError;

      toast.success('Запечатлено навсегда!');
      onMemoryAdded();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка сохранения');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setAuthor('');
    setExternalUrl('');
    setFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] bg-[#0A0A0A] border-white/5 p-0 overflow-hidden shadow-2xl outline-none">
        <VisuallyHidden.Root><DialogDescription>Форма добавления</DialogDescription></VisuallyHidden.Root>
        <DialogHeader className="p-8 pb-0 text-left">
          <DialogTitle className="text-2xl font-black tracking-tighter text-slate-100 uppercase">Новая глава</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Твоя история</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Опиши этот момент..."
              className="min-h-[120px] bg-white/[0.02] border-white/5 text-slate-200 placeholder:text-slate-700 focus:border-indigo-500/50 transition-all rounded-2xl resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Прикрепить медиа (TG limit 20MB)</Label>
            <div className="grid grid-cols-5 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                   {f.type.includes('image') ? <ImageIcon className="w-4 h-4 text-indigo-500" /> : <Film className="w-4 h-4 text-rose-500" />}
                </div>
              ))}
              {files.length < 10 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-white/5 hover:bg-white/[0.02] cursor-pointer flex items-center justify-center">
                  <Paperclip className="w-5 h-5 text-slate-700" />
                  <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Ссылка на Яндекс.Диск (для больших видео)</Label>
            <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <Input
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://disk.yandex.ru/..."
                    className="pl-11 bg-white/[0.02] border-white/5 text-slate-200 h-12 rounded-xl"
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Дата</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white/[0.02] border-white/5 text-slate-200 h-12 rounded-xl [color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Автор</Label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Кто заснял?" className="bg-white/[0.02] border-white/5 text-slate-200 h-12 rounded-xl" />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 text-slate-500 rounded-xl h-14 uppercase font-black text-[10px] tracking-widest">Отмена</Button>
            <Button type="submit" disabled={isUploading} className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-14 uppercase font-black text-[10px] tracking-widest shadow-xl shadow-indigo-500/20">
              {isUploading ? 'Загрузка...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemoryModal;