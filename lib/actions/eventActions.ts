"use server";

import Event from "@/models/event";
import { connectToDB } from "@/utils/database";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { requireActiveTeam } from "@/lib/permissions";

export async function createEvent(formData: {
  title: string;
  live: string;
  playList: string;
  date?: string;
  songs: Array<{ song: string; comment: string; ind: string; title: string }>;
}) {
  const filteredSongs = formData.songs.filter((song) => song.title !== "");
  const songIds = filteredSongs.map((song) => new mongoose.Types.ObjectId(song.song));

  try {
    await connectToDB();

    const newEvent = new Event({
      title: formData.title,
      live: formData.live,
      playList: formData.playList,
      date: formData.date ? new Date(formData.date) : undefined,
      songs: songIds.map((songId, index) => ({
        song: songId,
        comment: filteredSongs[index].comment,
        ind: String(index),
        title: filteredSongs[index].title,
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

export async function updateEvent(formData: {
  _id: number;
  title: string;
  live: string;
  playList: string;
  date?: string;
  songs: Array<{ song: string; comment: string; ind: string; title: string }>;
}) {
  const filteredSongs = formData.songs.filter((song) => song.title !== "");
  const songIds = filteredSongs.map((song) => new mongoose.Types.ObjectId(song.song));

  try {
    await connectToDB();

    const updatedEvent = await Event.findByIdAndUpdate(
      formData._id,
      {
        title: formData.title,
        live: formData.live,
        playList: formData.playList,
        date: formData.date ? new Date(formData.date) : undefined,
        songs: songIds.map((songId, index) => ({
          song: songId,
          comment: filteredSongs[index].comment,
          ind: String(index),
          title: filteredSongs[index].title,
        })),
      },
      { new: true, runValidators: true }
    );

    revalidatePath("/events");
    revalidatePath(`/events/${formData._id}`);
    return { success: true, eventId: formData._id };
  } catch (error) {
    console.error("Failed to update event:", error);
    return { success: false, error: "Failed to update event" };
  }
}

export async function getEventById(id: string) {
  try {
    await connectToDB();
    const event = await Event.findById(id).lean();

    if (!event) {
      throw new Error("Event not found");
    }

    const serializedEvent = JSON.parse(JSON.stringify(event));
    return serializedEvent;
  } catch (error) {
    console.error("Failed to fetch event:", error);
    throw new Error("Failed to fetch event");
  }
}

export async function deleteEvent(eventId: number) {
  try {
    await connectToDB();
    await Event.findByIdAndDelete(eventId);

    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete event:", error);
    return { success: false, error: "Failed to delete event" };
  }
}

export async function getAllEvents() {
  try {
    await connectToDB();
    const access = await requireActiveTeam();
    if (!access.ok) {
      return [] as any[];
    }
    const events = await Event.find({ team: access.teamId }).lean();
    const serialized = JSON.parse(JSON.stringify(events));
    return serialized;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    throw new Error("Failed to fetch events");
  }
}
