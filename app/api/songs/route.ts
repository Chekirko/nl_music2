import Song from "@/models/song";
import Event from "@/models/event";
import { connectToDB } from "@/utils/database";

export const dynamic = "force-dynamic";

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const filter = searchParams.get("filter");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 30;
    const skip = (page - 1) * limit;

    await connectToDB();

    let songs;
    let isNext = false;

    if (!filter || filter === "all") {
      const totalSongs = await Song.countDocuments();
      songs = await Song.find({});
    } else if (filter === "pop") {
      const popularSongs = await Event.aggregate([
        { $unwind: "$songs" },
        { $group: { _id: "$songs.song", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

      const songIds = popularSongs.map((song) => song._id);
      songs = await Song.find({ _id: { $in: songIds } });

      const totalPopularSongs = await Event.aggregate([
        { $unwind: "$songs" },
        { $group: { _id: "$songs.song" } },
      ]);

      isNext = totalPopularSongs.length > skip + limit;
    } else if (filter === "rare") {
      // Отримуємо всі пісні з подій з підрахунком їх появ
      const songsWithCount = await Event.aggregate([
        { $unwind: "$songs" },
        {
          $group: {
            _id: "$songs.song",
            count: { $sum: 1 },
          },
        },
      ]);

      // Створюємо Map для швидкого доступу до кількості появ пісні
      const songCountMap = new Map(
        songsWithCount.map((song) => [song._id.toString(), song.count])
      );

      // Отримуємо всі пісні з бази даних
      const allSongs = await Song.find({});

      // Розділяємо пісні на ті, що не з'являються в подіях, і ті, що з'являються рідко
      const neverUsedSongs: any = [];
      const rarelyUsedSongs: any = [];

      allSongs.forEach((song) => {
        const count = songCountMap.get(song._id.toString()) || 0;
        if (count === 0) {
          neverUsedSongs.push(song);
        } else if (count < 2) {
          // Можна налаштувати поріг рідкісності
          rarelyUsedSongs.push({
            song,
            count,
          });
        }
      });

      // Сортуємо рідковживані пісні за кількістю появ
      rarelyUsedSongs.sort((a: any, b: any) => a.count - b.count);

      // Об'єднуємо результати: спочатку невикористані, потім рідковживані
      const allRareSongs = [
        ...neverUsedSongs,
        ...rarelyUsedSongs.map((item: any) => item.song),
      ];

      // Застосовуємо пагінацію
      songs = allRareSongs.slice(skip, skip + limit);
      isNext = allRareSongs.length > skip + limit;
    } else {
      return new Response("Invalid filter", { status: 400 });
    }

    return new Response(
      JSON.stringify({
        songs,
        isNext,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching songs:", error);
    return new Response("Failed to fetch songs", { status: 500 });
  }
};
