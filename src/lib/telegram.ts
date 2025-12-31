/**
 * Telegram Bot API integration
 * Система мультизагрузки контента (Media Group)
 */

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';

interface TelegramMediaResponse {
  ok: boolean;
  result: any[]; // Массив сообщений при sendMediaGroup
  description?: string;
}

interface UploadToTelegramResult {
  success: boolean;
  messageId?: number;
  fileIds?: string[]; // Возвращаем массив ID для альбома
  error?: string;
}

/**
 * Получает прямую ссылку на файл
 */
// src/lib/telegram.ts

const TELEGRAM_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;

export async function getTelegramFileUrl(fileId: string): Promise<string | null> {
  if (!fileId || !TELEGRAM_TOKEN) return null;

  try {
    // 1. Получаем путь к файлу через API
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`);
    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API Error: - telegram.ts:39', data.description);
      return null;
    }

    const filePath = data.result.file_path;
    // 2. Возвращаем прямую ссылку
    return `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;
  } catch (err) {
    console.error('Network error fetching Telegram file: - telegram.ts:47', err);
    return null;
  }
}

/**
 * Проверяет, является ли строка Telegram file_id
 * (обычно длинный строковый идентификатор)
 */
export function isTelegramFileId(content: string): boolean {
  if (!content) return false;
  // Telegram file_id обычно длинный строковый идентификатор без пробелов
  // Проверяем, что это не URL и не пустой текст
  return (
    typeof content === 'string' &&
    !content.startsWith('http://') && 
    !content.startsWith('https://') && 
    content.length > 20 &&
    !content.includes(' ')
  );
}

/**
 * Основная функция отправки
 */
export async function uploadToTelegram(
  content: string,
  files?: File | File[] | null,
  author?: string
): Promise<UploadToTelegramResult> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return { success: false, error: 'Telegram не настроен' };
  }

  // Формируем текст подписи (Текст истории + Автор)
  const fullCaption = author ? `${content}\n\n— Автор: ${author}` : content;

  try {
    // СЛУЧАЙ 1: Только текст
    if (!files || (Array.isArray(files) && files.length === 0)) {
      const response = await fetch(`${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: fullCaption,
          parse_mode: 'HTML'
        }),
      });
      const data = await response.json();
      return data.ok 
        ? { success: true, messageId: data.result.message_id } 
        : { success: false, error: data.description };
    }

    // СЛУЧАЙ 2: Альбом (Media Group)
    if (Array.isArray(files)) {
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);

      const mediaGroup = files.map((file, index) => {
        const type = file.type.startsWith('video/') ? 'video' : 'photo';
        const mediaName = `media${index}`;
        formData.append(mediaName, file);
        
        return {
          type,
          media: `attach://${mediaName}`,
          // Подпись добавляем только к первому элементу альбома (правило Telegram)
          caption: index === 0 ? fullCaption : '',
          parse_mode: 'HTML'
        };
      });

      formData.append('media', JSON.stringify(mediaGroup));

      const response = await fetch(`${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/sendMediaGroup`, {
        method: 'POST',
        body: formData,
      });

      const data: TelegramMediaResponse = await response.json();
      if (!data.ok) return { success: false, error: data.description };

      // Извлекаем file_ids из всех отправленных медиа
      const fileIds = data.result.map(msg => {
        if (msg.photo) return msg.photo[msg.photo.length - 1].file_id;
        if (msg.video) return msg.video.file_id;
        return '';
      });

      return {
        success: true,
        messageId: data.result[0].message_id,
        fileIds
      };
    }

    // СЛУЧАЙ 3: Один файл (старая логика для совместимости)
    const formData = new FormData();
    const isVideo = files.type.startsWith('video/');
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append(isVideo ? 'video' : 'photo', files);
    formData.append('caption', fullCaption);
    formData.append('parse_mode', 'HTML');

    const response = await fetch(`${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/${isVideo ? 'sendVideo' : 'sendPhoto'}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!data.ok) return { success: false, error: data.description };

    const fileId = isVideo 
      ? data.result.video.file_id 
      : data.result.photo[data.result.photo.length - 1].file_id;

    return { success: true, messageId: data.result.message_id, fileIds: [fileId] };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


/**
 * Получает прямую ссылку на фото из Telegram по file_id
 * Используется компонентом PhotoViewer
 */
export async function getTelegramPhotoUrl(fileId: string): Promise<string | null> {
  return getTelegramFileUrl(fileId);
}