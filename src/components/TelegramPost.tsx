import React, { useEffect, useRef } from 'react';

interface TelegramPostProps {
  messageId: number;
  chatId: string; // @username канала или chat_id
  className?: string;
}

/**
 * Компонент для отображения поста из Telegram через Telegram Widget API
 * Требует, чтобы канал был публичным
 */
const TelegramPost: React.FC<TelegramPostProps> = ({ messageId, chatId, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Очищаем предыдущий контент
    containerRef.current.innerHTML = '';

    // Создаем iframe для Telegram Post Widget
    // Формат: https://t.me/{channel}/{post_id}
    // Для виджета используем embed версию
    const iframe = document.createElement('iframe');
    iframe.src = `https://t.me/${chatId.replace('@', '')}/${messageId}?embed=1`;
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    iframe.width = '100%';
    iframe.height = '500';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    
    containerRef.current.appendChild(iframe);

    // Альтернативный вариант - использовать Telegram Widget Script
    // Но он требует загрузки внешнего скрипта
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-post', `${chatId}/${messageId}`);
    script.setAttribute('data-width', '100%');
    script.async = true;
    
    // Заменяем iframe на виджет
    script.onload = () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(script);
      }
    };

    // Для простоты используем iframe
  }, [messageId, chatId]);

  return (
    <div 
      ref={containerRef} 
      className={`telegram-post-container ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
};

export default TelegramPost;

