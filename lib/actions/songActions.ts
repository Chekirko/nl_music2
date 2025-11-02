"use server";

import Song from "@/models/song";
import Event from "@/models/event";
import { connectToDB } from "@/utils/database";
import { revalidatePath } from "next/cache";
import type { GettedSong } from "@/types";
import { requireActiveTeam } from "@/lib/permissions";

export async function getSongs(
  filter?: string,
  page: number = 1,
  searchQuery?: string
): Promise<{ songs: GettedSong[]; isNext: boolean }> {
  try {
    const limit = 30;
    const skip = (page - 1) * limit;

    await connectToDB();

    let songs: any[] = [];
    let isNext = false;

    const searchFilter = searchQuery
      ? { title: { $regex: searchQuery, $options: "i" } }
      : {};

    if (!filter || filter === "all") {
      const totalSongs = await Song.countDocuments(searchFilter);
      songs = await Song.find(searchFilter).lean();
      isNext = totalSongs > skip + limit;
    } else if (filter === "pop") {
      const popularSongs = await Event.aggregate([
        { $unwind: "$songs" },
        { $group: { _id: "$songs.song", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

      const songIds = popularSongs.map((s: any) => s._id);
      songs = await Song.find({ _id: { $in: songIds }, ...searchFilter }).lean();

      const totalPopularSongs = await Event.aggregate([
        { $unwind: "$songs" },
        { $group: { _id: "$songs.song" } },
      ]);
      isNext = totalPopularSongs.length > skip + limit;
    } else if (filter === "rare") {
      const songsWithCount = await Event.aggregate([
        { $unwind: "$songs" },
        { $group: { _id: "$songs.song", count: { $sum: 1 } } },
      ]);

      const songCountMap = new Map<string, number>(
        songsWithCount.map((s: any) => [String(s._id), s.count])
      );

      const allSongs = await Song.find(searchFilter).lean();

      const neverUsedSongs: any[] = [];
      const rarelyUsedSongs: Array<{ song: any; count: number }> = [];

      allSongs.forEach((s: any) => {
        const count = songCountMap.get(String(s._id)) || 0;
        if (count === 0) {
          neverUsedSongs.push(s);
        } else if (count < 2) {
          rarelyUsedSongs.push({ song: s, count });
        }
      });

      rarelyUsedSongs.sort((a, b) => a.count - b.count);

      const allRareSongs = [
        ...neverUsedSongs,
        ...rarelyUsedSongs.map((item) => item.song),
      ];

      songs = allRareSongs.slice(skip, skip + limit);
      isNext = allRareSongs.length > skip + limit;
    } else {
      throw new Error("Invalid filter");
    }

    const serializedSongs = JSON.parse(JSON.stringify(songs)) as GettedSong[];
    return { songs: serializedSongs, isNext };
  } catch (error) {
    console.error("Error fetching songs:", error);
    throw new Error("Failed to fetch songs");
  }
}

export async function getSongById(id: string): Promise<GettedSong> {
  try {
    await connectToDB();
    const song = await Song.findById(id).lean();
    if (!song) throw new Error("Song not found");
    return JSON.parse(JSON.stringify(song)) as GettedSong;
  } catch (error) {
    console.error("Failed to fetch song:", error);
    throw new Error("Failed to fetch song");
  }
}

export async function deleteSong(
  songId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDB();
    await Song.findByIdAndDelete(songId);
    revalidatePath("/songs");
    revalidatePath(`/songs/${songId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete song:", error);
    return { success: false, error: "Failed to delete song" };
  }
}

type UpdatableBlock = {
  name: string;
  version: string | number;
  lines: string;
  ind: string | number;
};

export async function updateSongAction(formData: {
  _id: string | number;
  title: string;
  rythm: string;
  tags: string;
  comment: string;
  key: string;
  mode: string;
  origin: string;
  video: string;
  ourVideo: string;
  blocks: UpdatableBlock[];
}): Promise<{ success: true; song: GettedSong } | { success: false; error: string }> {
  try {
    await connectToDB();

    const updated = await Song.findByIdAndUpdate(
      formData._id,
      {
        title: formData.title,
        comment: formData.comment,
        rythm: formData.rythm,
        tags: formData.tags,
        key: formData.key,
        mode: formData.mode,
        origin: formData.origin,
        video: formData.video,
        ourVideo: formData.ourVideo,
        blocks: formData.blocks,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return { success: false, error: "Song not found" };
    }

    const serialized = JSON.parse(JSON.stringify(updated)) as GettedSong;
    revalidatePath("/songs");
    revalidatePath(`/songs/${formData._id}`);
    return { success: true, song: serialized };
  } catch (error) {
    console.error("Failed to update song:", error);
    return { success: false, error: "Failed to update song" };
  }
}

type NewSongBlock = {
  name: string;
  version: string | number;
  lines: string;
  ind: string | number;
};

export async function createSongAction(formData: {
  title: string;
  comment: string;
  rythm: string;
  tags: string;
  key: string;
  mode: string;
  origin: string;
  video: string;
  ourVideo: string;
  blocks: NewSongBlock[];
}): Promise<
  | { success: true; song: GettedSong; songId: string }
  | { success: false; error: string; existing?: GettedSong }
> {
  try {
    const access = await requireActiveTeam();
    if (!access.ok) {
      return { success: false, error: "Active team required" };
    }

    await connectToDB();

    // Uniqueness within team
    const exists = await (Song as any)
      .findOne({ title: formData.title, team: access.teamId })
      .lean();
    if (exists) {
      const serializedExisting = JSON.parse(JSON.stringify(exists)) as GettedSong;
      return {
        success: false,
        error: "Song with this title already exists in team",
        existing: serializedExisting,
      };
    }

    const normalizedBlocks = formData.blocks.map((b) => ({
      name: b.name,
      version: Number(b.version),
      lines: b.lines,
      ind: Number(b.ind),
    }));

    const newSong = new (Song as any)({
      title: formData.title,
      comment: formData.comment,
      rythm: formData.rythm,
      tags: formData.tags,
      key: formData.key,
      mode: formData.mode,
      origin: formData.origin,
      video: formData.video,
      ourVideo: formData.ourVideo,
      blocks: normalizedBlocks,
      team: access.teamId,
      createdBy: access.userId,
      isOriginal: true,
    });

    await newSong.save();

    const serialized = JSON.parse(JSON.stringify(newSong)) as GettedSong;
    const songId = (newSong as any)._id ? String((newSong as any)._id) : (serialized as any)._id;
    revalidatePath("/songs");
    return { success: true, song: serialized, songId };
  } catch (error) {
    console.error("Failed to create song:", error);
    return { success: false, error: "Failed to create song" };
  }
}
