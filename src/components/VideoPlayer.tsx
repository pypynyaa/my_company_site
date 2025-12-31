import React, { useState, useEffect } from 'react';
import { getTelegramFileUrl } from '@/lib/telegram';
import { AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  telegramFileId: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ telegramFileId, className }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideo() {
      setLoading(true);
      setError(false);
      try {
        const url = await getTelegramFileUrl(telegramFileId);
        if (url) {
          setVideoUrl(url);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadVideo();
  }, [telegramFileId]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-white/5 animate-pulse rounded-2xl ${className}`}>
        <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Декодирование...</div>
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <div className={`flex flex-col items-center justify-center bg-white/5 gap-4 p-8 rounded-2xl text-center ${className}`}>
        <AlertCircle className="w-10 h-10 text-rose-500 opacity-50" />
        <div className="space-y-1">
            <p className="text-slate-200 font-bold uppercase text-xs tracking-tighter">Ошибка воспроизведения</p>
            <p className="text-slate-500 text-[10px] leading-relaxed max-w-[200px]">Файл слишком большой для прямого стриминга через Telegram API.</p>
        </div>
        <Button 
            variant="outline" 
            onClick={() => window.open(videoUrl || '#', '_blank')}
            className="h-10 rounded-full border-white/10 text-[10px] uppercase font-black tracking-widest bg-white/5"
        >
            Попробовать открыть
        </Button>
      </div>
    );
  }

  return (
    <video 
      src={videoUrl} 
      controls 
      playsInline
      className={`rounded-2xl shadow-2xl bg-black object-contain ${className}`}
      onError={() => setError(true)}
    />
  );
};

export default VideoPlayer;