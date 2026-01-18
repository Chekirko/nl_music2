"use server";

import Tag from "@/models/tag";
import { connectToDB } from "@/utils/database";
import { normalizeTag } from "@/lib/tagHelpers";

/**
 * Оновлює лічильники songsCount при зміні тегів пісні.
 * Викликається при створенні, редагуванні та видаленні пісні.
 *
 * @param oldTags - масив тегів до зміни ([] для нової пісні)
 * @param newTags - масив тегів після зміни ([] при видаленні)
 */
export async function updateTagCounts(
  oldTags: string[],
  newTags: string[]
): Promise<void> {
  await connectToDB();

  const normalizedOld = oldTags.map(normalizeTag).filter((t) => t.length > 0);
  const normalizedNew = newTags.map(normalizeTag).filter((t) => t.length > 0);

  // Теги для декременту (були, але тепер немає)
  const toDecrement = normalizedOld.filter((t) => !normalizedNew.includes(t));
  // Теги для інкременту (нові)
  const toIncrement = normalizedNew.filter((t) => !normalizedOld.includes(t));

  // Декремент для видалених тегів
  for (const tag of toDecrement) {
    await Tag.findOneAndUpdate({ name: tag }, { $inc: { songsCount: -1 } });
  }

  // Інкремент для нових тегів (upsert створить якщо не існує)
  for (const tag of toIncrement) {
    await Tag.findOneAndUpdate(
      { name: tag },
      { $inc: { songsCount: 1 } },
      { upsert: true }
    );
  }
}

/**
 * Отримує всі теги з кількістю пісень > 0.
 * Сортує по кількості пісень (спаданням).
 */
export async function getAllTags(): Promise<
  Array<{ _id: string; name: string; songsCount: number }>
> {
  await connectToDB();
  const tags = await Tag.find({ songsCount: { $gt: 0 } })
    .sort({ songsCount: -1 })
    .lean();
  return JSON.parse(JSON.stringify(tags));
}

/**
 * Пошук тегів за частковим збігом (для автопідказок).
 * Повертає максимум 10 результатів.
 */
export async function searchTags(
  query: string
): Promise<Array<{ _id: string; name: string; songsCount: number }>> {
  await connectToDB();
  const tags = await Tag.find({
    name: { $regex: query, $options: "i" },
    songsCount: { $gt: 0 },
  })
    .limit(10)
    .lean();
  return JSON.parse(JSON.stringify(tags));
}
