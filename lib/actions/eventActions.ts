"use server";

import Event from "@/models/event";
import { connectToDB } from "@/utils/database";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export async function createEvent(formData: {
  title: string;
  live: string;
  playList: string;
  date?: string;
  songs: Array<{ song: string; comment: string; ind: string; title: string }>;
}) {
  const filteredSongs = formData.songs.filter((song) => song.title !== "");
  const sortedSongs = filteredSongs.sort(
    (a, b) => Number(a.ind) - Number(b.ind)
  );

  const songIds = sortedSongs.map(
    (song) => new mongoose.Types.ObjectId(song.song)
  );

  try {
    await connectToDB();

    const newEvent = new Event({
      title: formData.title,
      live: formData.live,
      playList: formData.playList,
      date: formData.date ? new Date(formData.date) : undefined,
      songs: songIds.map((songId, index) => ({
        song: songId,
        comment: sortedSongs[index].comment,
        ind: sortedSongs[index].ind,
        title: sortedSongs[index].title,
      })),
    });

    await newEvent.save();

    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Failed to create event:", error);
    return { success: false, error: "Failed to create event" };
  }
}
