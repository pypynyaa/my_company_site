import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Проверка для отладки в консоли браузера
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Критическая ошибка: Переменные окружения Supabase не найдены! - client.ts:8');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Экспортируем флаг для других компонентов
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);