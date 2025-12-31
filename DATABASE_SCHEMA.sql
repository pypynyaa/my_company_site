-- Схема базы данных для проекта Friends Story

-- Таблица воспоминаний (memories)
-- Хранит только метаданные, весь контент в Telegram
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('photo', 'text', 'video')),
  content TEXT, -- Текст для текстовых сообщений (для совместимости), для фото/видео может быть пустым
  telegram_message_id INTEGER NOT NULL, -- ID сообщения в Telegram (главный идентификатор)
  telegram_file_id TEXT, -- Telegram file_id для фото/видео (опционально, для быстрого доступа)
  caption TEXT,
  author TEXT,
  year_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица писем (letters)
-- Для анонимных писем и писем в будущее
CREATE TABLE IF NOT EXISTS letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  recipient TEXT NOT NULL, -- Имя получателя (может быть "себе")
  sender TEXT, -- Имя отправителя (null для анонимных)
  scheduled_for TIMESTAMP WITH TIME ZONE, -- Дата и время доставки (null для немедленной)
  is_delivered BOOLEAN DEFAULT FALSE, -- Флаг доставки (для отложенных писем)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_memories_year ON memories(year_number);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_letters_recipient ON letters(recipient);
CREATE INDEX IF NOT EXISTS idx_letters_scheduled ON letters(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_letters_delivered ON letters(is_delivered) WHERE is_delivered = FALSE;

-- Комментарии к таблицам
COMMENT ON TABLE memories IS 'Воспоминания (текст, фото, видео) с привязкой к году обучения';
COMMENT ON COLUMN memories.telegram_message_id IS 'ID сообщения в Telegram - основной идентификатор контента';
COMMENT ON COLUMN memories.telegram_file_id IS 'Telegram file_id для фото/видео (для получения прямых ссылок)';
COMMENT ON COLUMN memories.content IS 'Текст для текстовых сообщений (для совместимости)';
COMMENT ON TABLE letters IS 'Анонимные письма и письма в будущее';
COMMENT ON COLUMN letters.scheduled_for IS 'Дата и время доставки письма (null = немедленно)';
COMMENT ON COLUMN letters.is_delivered IS 'Флаг доставки для отложенных писем';

ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS telegram_message_id INTEGER;

