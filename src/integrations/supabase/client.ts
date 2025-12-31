import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  getLocalMemoriesByYear,
  saveLocalMemory,
  deleteLocalMemory,
  getLocalMemories,
} from '@/lib/localStorage';

// Очищаем URL от возможных пробелов и лишних символов
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Проверяем валидность URL (должен начинаться с http)
const isValidUrl = supabaseUrl?.startsWith('http');
const isSupabaseConfigured = !!(isValidUrl && supabaseAnonKey);

const createMockClient = (): SupabaseClient => {
  const createQueryBuilder = (table: string) => {
    let yearFilter: number | null = null;
    let idFilter: string | null = null;
    let orderField: string = 'created_at';
    let orderAsc: boolean = false;
    let isDeleteOperation = false;

    const builder: any = {
      select: function() { isDeleteOperation = false; return this; },
      insert: function(data: any) {
        let saved;
        if (table === 'memories') {
          saved = Array.isArray(data) ? data.map(saveLocalMemory) : [saveLocalMemory(data)];
        }
        return Promise.resolve({ data: saved, error: null });
      },
      update: function() { return this; },
      delete: function() { isDeleteOperation = true; return this; },
      eq: function(field: string, value: any) {
        if (field === 'year_number') yearFilter = value;
        if (field === 'id') idFilter = value;
        return this;
      },
      order: function(field: string, options?: any) {
        orderField = field;
        orderAsc = options?.ascending ?? false;
        return this;
      },
      // Важно для совместимости с async/await
      then: async function(resolve: any) {
        if (isDeleteOperation && idFilter) {
          deleteLocalMemory(idFilter);
          return resolve({ data: null, error: null });
        }
        if (table === 'memories') {
          const memories = yearFilter !== null ? getLocalMemoriesByYear(yearFilter) : getLocalMemories();
          memories.sort((a: any, b: any) => {
            const aVal = a[orderField];
            const bVal = b[orderField];
            return orderAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
          });
          return resolve({ data: memories, error: null });
        }
        return resolve({ data: [], error: null });
      }
    };
    return builder;
  };

  return {
    from: (table: string) => createQueryBuilder(table),
    channel: () => ({
      on: function() { return this; },
      subscribe: () => ({ unsubscribe: () => {} }),
      track: () => ({}),
    }),
    removeChannel: () => {},
    removeAllChannels: () => {},
    storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: '' } }) }) }
  } as any;
};

let supabase: SupabaseClient;

// Если URL невалидный (например, placeholder или пусто), сразу используем Мок
if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase не настроен или URL невалиден. Работаем через localStorage. - client.ts:84');
  supabase = createMockClient();
} else {
  try {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  } catch (e) {
    supabase = createMockClient();
  }
}

export { supabase, isSupabaseConfigured };