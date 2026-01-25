"use server";

import Event from "@/models/event";
import Song from "@/models/song";
import { connectToDB } from "@/utils/database";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { canCreateEvent, canDeleteEvent, canEditEvent, requireActiveTeam } from "@/lib/permissions";

type IncomingEventSong = {
  song: string;
  comment: string;
  ind: string;
  title: string;
};

async function normalizeSongsForTeam(songs: IncomingEventSong[], teamId: string) {
  await connectToDB();
  const prepared = songs
    .map((song, idx) => ({
      rawId: song.song?.trim(),
      comment: song.comment?.trim() || "",
      ind: String(idx),
      title: song.title?.trim() || "",
    }))
    .filter((song) => song.rawId && mongoose.Types.ObjectId.isValid(song.rawId) && song.title);

  if (!prepared.length) {
    return { ok: false as const, error: "Не вибрано жодної пісні" } as const;
  }

  const ids = prepared.map((song) => new mongoose.Types.ObjectId(song.rawId));
  const teamSongs = await Song.find({ _id: { $in: ids }, team: teamId })
    .select("_id")
    .lean();
  const allowedIds = new Set(teamSongs.map((song) => String(song._id)));
  const hasForeign = prepared.some((song) => !allowedIds.has(song.rawId!));
  if (hasForeign) {
    return { ok: false as const, error: "Деякі пісні не належать активній команді" } as const;
  }

  const normalized = prepared.map((song) => ({
    song: new mongoose.Types.ObjectId(song.rawId),
    comment: song.comment,
    ind: song.ind,
    title: song.title,
  }));

  return { ok: true as const, songs: normalized } as const;
}

export async function createEvent(formData: {
  title: string;
  live: string;
  playList: string;
  date?: string;
  songs: IncomingEventSong[];
}) {
  try {
    const access = await canCreateEvent();
    if (!access.ok) {
      return { success: false as const, error: access.message };
    }

    const normalizedSongs = await normalizeSongsForTeam(formData.songs, access.teamId);
    if (!normalizedSongs.ok) {
      return { success: false as const, error: normalizedSongs.error };
    }

    await connectToDB();
    const newEvent = new Event({
      title: formData.title,
      live: formData.live,
      playList: formData.playList,
      date: formData.date ? new Date(formData.date) : undefined,
      songs: normalizedSongs.songs,
      team: access.teamId,
      createdBy: access.userId,
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
  _id: number | string;
  title: string;
  live: string;
  playList: string;
  date?: string;
  songs: IncomingEventSong[];
}) {
  try {
    const access = await canEditEvent(String(formData._id));
    if (!access.ok) {
      return { success: false as const, error: access.message };
    }

    const normalizedSongs = await normalizeSongsForTeam(formData.songs, access.teamId);
    if (!normalizedSongs.ok) {
      return { success: false as const, error: normalizedSongs.error };
    }

    await connectToDB();
    const updatedEvent = await Event.findByIdAndUpdate(
      formData._id,
      {
        title: formData.title,
        live: formData.live,
        playList: formData.playList,
        date: formData.date ? new Date(formData.date) : undefined,
        songs: normalizedSongs.songs,
        team: access.teamId,
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

export async function deleteEvent(eventId: number | string) {
  try {
    const allowed = await canDeleteEvent(String(eventId));
    if (!allowed.ok) {
      return { success: false as const, error: allowed.message };
    }
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
    const events = await Event.find({
      $or: [
        { team: access.teamId },
        { team: { $exists: false } },
        { team: null },
      ],
    }).lean();
    const serialized = JSON.parse(JSON.stringify(events));
    return serialized;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    throw new Error("Failed to fetch events");
  }
}

export async function toggleEventPublicAction(eventId: string) {
  try {
    const access = await canEditEvent(eventId);
    if (!access.ok) {
      return { success: false as const, error: access.message };
    }

    await connectToDB();
    const event = await Event.findById(eventId).select("isPublic").lean() as { isPublic?: boolean } | null;
    if (!event) {
      return { success: false as const, error: "Подію не знайдено" };
    }

    const newValue = !event.isPublic;
    await Event.findByIdAndUpdate(eventId, { isPublic: newValue });

    revalidatePath(`/events/${eventId}`);
    return { success: true as const, isPublic: newValue };
  } catch (error) {
    console.error("Failed to toggle event public:", error);
    return { success: false as const, error: "Не вдалося змінити статус" };
  }
}
