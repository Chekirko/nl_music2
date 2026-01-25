/**
 * Допоміжні функції для роботи з тегами (синхронні).
 * Цей файл НЕ має "use server", тому може містити звичайні функції.
 */

/**
 * Нормалізує тег: lowercase, trim
 */
export function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim();
}

/**
 * Допоміжна функція для парсингу тегів.
 * Обробляє як старий формат (рядок), так і новий (масив).
 */
export function parseTags(tags: string | string[] | undefined | null): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map(normalizeTag).filter((t) => t.length > 0);
  }
  // Старий формат — рядок через пробіл
  return tags
    .split(" ")
    .map(normalizeTag)
    .filter((t) => t.length > 0);
}
