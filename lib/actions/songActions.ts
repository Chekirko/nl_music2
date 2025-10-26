"use server";

import Song from "@/models/song";
import Event from "@/models/event";
import { connectToDB } from "@/utils/database";

export async function getSongs(filter?: string, page: number = 1) {
  try {
    const limit = 30;
    const skip = (page - 1) * limit;

    await connectToDB();

    let songs;
    let isNext = false;

    if (!filter || filter === "all") {
      const totalSongs = await Song.countDocuments();
      songs = await Song.find({}).lean();
      isNext = totalSongs > skip + limit;
    } else if (filter === "pop") {
      const popularSongs = await Event.aggregate([
        { $unwind: "$songs" },
        { $group: { _id: "$songs.song", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

      const songIds = popularSongs.map((song) => song._id);
      songs = await Song.find({ _id: { $in: songIds } }).lean();

      const totalPopularSongs = await Event.aggregate([
        { $unwind: "$songs" },
        { $group: { _id: "$songs.song" } },
      ]);

      isNext = totalPopularSongs.length > skip + limit;
    } else if (filter === "rare") {
      const songsWithCount = await Event.aggregate([
        { $unwind: "$songs" },
        {
          $group: {
            _id: "$songs.song",
            count: { $sum: 1 },
          },
        },
      ]);

      const songCountMap = new Map(
        songsWithCount.map((song) => [song._id.toString(), song.count])
      );

      const allSongs = await Song.find({}).lean();

      const neverUsedSongs: any = [];
      const rarelyUsedSongs: any = [];

      allSongs.forEach((song: any) => {
        const count = songCountMap.get(song._id.toString()) || 0;
        if (count === 0) {
          neverUsedSongs.push(song);
        } else if (count < 2) {
          rarelyUsedSongs.push({
            song,
            count,
          });
        }
      });

      rarelyUsedSongs.sort((a: any, b: any) => a.count - b.count);

      const allRareSongs = [
        ...neverUsedSongs,
        ...rarelyUsedSongs.map((item: any) => item.song),
      ];

      songs = allRareSongs.slice(skip, skip + limit);
      isNext = allRareSongs.length > skip + limit;
    } else {
      throw new Error("Invalid filter");
    }

    // Конвертуємо MongoDB ObjectId в string для серіалізації
    const serializedSongs = JSON.parse(JSON.stringify(songs));

    return {
      songs: serializedSongs,
      isNext,
    };
  } catch (error) {
    console.error("Error fetching songs:", error);
    throw new Error("Failed to fetch songs");
  }
}
