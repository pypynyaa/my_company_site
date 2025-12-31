import React, { useState, useEffect } from 'react';
import { getTelegramFileUrl } from '@/lib/telegram';

interface PhotoViewerProps {
  src?: string; // Сделали необязательным
  telegramFileId?: string;
  className?: string;
  objectFit?: 'cover' | 'contain';
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({ 
  src, 
  telegramFileId, 
  className = "", 
  objectFit = "cover" 
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(src || null);
  const [loading, setLoading] = useState(!!telegramFileId);

  useEffect(() => {
    if (telegramFileId) {
      const loadUrl = async () => {
        const url = await getTelegramFileUrl(telegramFileId);
        setImageUrl(url);
        setLoading(false);
      };
      loadUrl();
    }
  }, [telegramFileId]);

  if (loading) {
    return <div className={`bg-white/5 animate-pulse ${className}`} />;
  }

  return (
    <img
      src={imageUrl || ''}
      alt="Memory"
      className={`${className} transition-opacity duration-500`}
      style={{ objectFit }}
      loading="lazy"
    />
  );
};

export default PhotoViewer;