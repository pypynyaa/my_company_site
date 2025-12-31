/**
 * Локальное хранилище для работы без Supabase
 * Использует localStorage для сохранения воспоминаний
 */

import { MemoryItem } from '@/components/MemoryCard';

const STORAGE_KEY = 'friends_memories';

export function getLocalMemories(): MemoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    // Сортируем по дате сразу при получении, чтобы лента всегда была красивой
    const parsed: MemoryItem[] = JSON.parse(data);
    return parsed.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

export function saveLocalMemory(memory: Omit<MemoryItem, 'id'>): MemoryItem {
  const memories = getLocalMemories();
  
  const newMemory: MemoryItem = {
    ...memory,
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    // Если дата передана из модалки — берем её, если нет — ставим текущую
    created_at: memory.created_at || new Date().toISOString(),
  };

  memories.push(newMemory);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  return newMemory;
}

export function deleteLocalMemory(id: string): boolean {
  const memories = getLocalMemories();
  const filtered = memories.filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered.length < memories.length;
}

export function getLocalMemoriesByYear(yearNumber: number): MemoryItem[] {
  const memories = getLocalMemories();
  return memories.filter(m => Number(m.year_number) === Number(yearNumber));
}

/**
 * Полезная функция для очистки всего хранилища (вызывать из консоли при тестах)
 */
export function clearAllLocalMemories(): void {
  localStorage.removeItem(STORAGE_KEY);
}