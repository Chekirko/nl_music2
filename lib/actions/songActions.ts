"use server";

import Song from "@/models/song";
import Event from "@/models/event";
import Team from "@/models/teams";
import { connectToDB } from "@/utils/database";
import { revalidatePath } from "next/cache";
import type {
  Block,
  GettedSong,
  SongCopyContext,
  CopySongResult,
  SongCopyConflictPreview,
  Team as TeamInfo,
} from "@/types";
import { updateTagCounts } from "@/lib/actions/tagActions";
import { parseTags } from "@/lib/tagHelpers";
import { canCreateSong, canEditSong, canDeleteSong, requireActiveTeam } from "@/lib/permissions";
import mongoose from "mongoose";

function mapSongDocument(doc: any): GettedSong {
  if (!doc) {
    throw new Error("Song document is required");
  }

  const resolveId = (value: any): string | undefined => {
    if (!value) return undefined;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value._id) return String(value._id);
    return undefined;
  };

  const teamId = resolveId(doc.team) || undefined;
  const teamName =
    doc.team && typeof doc.team === "object" && "name" in doc.team ? (doc.team as any).name : undefined;

  let copiedFromId: string | undefined;
  let copiedFromTitle: string | undefined;
  let copiedFromTeamId: string | undefined;
  let copiedFromTeamName: string | undefined;

  if (doc.copiedFrom) {
    if (typeof doc.copiedFrom === "string") {
      copiedFromId = doc.copiedFrom;
    } else if (typeof doc.copiedFrom === "object") {
      copiedFromId = resolveId(doc.copiedFrom);
      copiedFromTitle = (doc.copiedFrom as any).title;
      const copiedFromTeam = (doc.copiedFrom as any).team;
      if (copiedFromTeam) {
        copiedFromTeamId = resolveId(copiedFromTeam);
        copiedFromTeamName =
          copiedFromTeam && typeof copiedFromTeam === "object" && "name" in copiedFromTeam
            ? (copiedFromTeam as any).name
            : copiedFromTeamName;
      }
    }
  }

  const blocks: Block[] = Array.isArray(doc.blocks)
    ? doc.blocks.map((block: any) => ({
        name: block.name || "",
        version: String(block.version ?? ""),
        lines: block.lines || "",
        ind: String(block.ind ?? ""),
      }))
    : [];

  return {
    _id: String(doc._id),
    title: doc.title || "",
    rythm: doc.rythm || "",
    tags: parseTags(doc.tags),
    comment: doc.comment || "",
    key: doc.key || "",
    mode: doc.mode || "",
    origin: doc.origin || "",
    video: doc.video || "",
    ourVideo: doc.ourVideo || "",
    blocks,
    team: teamId,
    teamName,
    createdBy: doc.createdBy ? String(doc.createdBy) : undefined,
    copiedFrom: copiedFromId,
    copiedFromTitle,
    copiedFromTeamId,
    copiedFromTeamName,
    copiedBy: doc.copiedBy ? String(doc.copiedBy) : undefined,
    isOriginal: typeof doc.isOriginal === "boolean" ? doc.isOriginal : undefined,
    copiedAt: doc.copiedAt ? new Date(doc.copiedAt).toISOString() : undefined,
  };
}

export async function getSongs(
  filter?: string,
  page: number = 1,
  searchQuery?: string,
  scope: "team" | "all" = "all"
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

    let teamFilter: any = {};
    let eventMatch: any = {};
    if (scope === "team") {
      const access = await requireActiveTeam();
      if (!access.ok) {
        return { songs: [], isNext: false };
      }
      teamFilter = { team: access.teamId };
      eventMatch = { team: new mongoose.Types.ObjectId(access.teamId) };
    }

    if (!filter || filter === "all") {
      const totalSongs = await Song.countDocuments({ ...teamFilter, ...searchFilter });
      songs = await Song.find({ ...teamFilter, ...searchFilter }).lean();
      isNext = totalSongs > skip + limit;
    } else if (filter === "pop") {
      const popularSongs = await Event.aggregate([
        ...(scope === "team" ? [{ $match: eventMatch }] : []),
        { $unwind: "$songs" },
        { $group: { _id: "$songs.song", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

      const songIds = popularSongs.map((s: any) => s._id);
      songs = await Song.find({ _id: { $in: songIds }, ...teamFilter, ...searchFilter }).lean();

      const totalPopularSongs = await Event.aggregate([
        ...(scope === "team" ? [{ $match: eventMatch }] : []),
        { $unwind: "$songs" },
        { $group: { _id: "$songs.song" } },
      ]);
      isNext = totalPopularSongs.length > skip + limit;
    } else if (filter === "rare") {
      const songsWithCount = await Event.aggregate([
        ...(scope === "team" ? [{ $match: eventMatch }] : []),
        { $unwind: "$songs" },
        { $group: { _id: "$songs.song", count: { $sum: 1 } } },
      ]);

      const songCountMap = new Map<string, number>(
        songsWithCount.map((s: any) => [String(s._id), s.count])
      );

      const allSongs = await Song.find({ ...teamFilter, ...searchFilter }).lean();

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

export async function searchSongsAction(params: {
  q: string;
  filter?: string;
  scope?: "team" | "all";
  mode?: "title" | "text";
}) {
  try {
    const { q, filter = "all", scope = "all", mode = "title" } = params;
    await connectToDB();

    const rx = new RegExp(q, "i");
    const searchFilter = q
      ? mode === "text"
        ? { "blocks.lines": rx as any }
        : { title: rx as any }
      : {};

    let teamFilter: any = {};
    let eventMatch: any = {};
    if (scope === "team") {
      const access = await requireActiveTeam();
      if (!access.ok) return [] as GettedSong[];
      teamFilter = { team: access.teamId };
      eventMatch = { team: new mongoose.Types.ObjectId(access.teamId) };
    }

    const limit = 30;
    let songs: any[] = [];

    if (!filter || filter === "all") {
      songs = await Song.find({ ...teamFilter, ...searchFilter })
        .limit(limit)
        .lean();
    } else if (filter === "pop") {
      const popularSongs = await Event.aggregate([
        ...(scope === "team" ? [{ $match: eventMatch }] : []),
        { $unwind: "$songs" },
        { $group: { _id: "$songs.song", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ]);
      const songIds = popularSongs.map((s: any) => s._id);
      songs = await Song.find({ _id: { $in: songIds }, ...teamFilter, ...searchFilter })
        .limit(limit)
        .lean();
    } else if (filter === "rare") {
      const songsWithCount = await Event.aggregate([
        ...(scope === "team" ? [{ $match: eventMatch }] : []),
        { $unwind: "$songs" },
        { $group: { _id: "$songs.song", count: { $sum: 1 } } },
      ]);
      const songCountMap = new Map<string, number>(
        songsWithCount.map((s: any) => [String(s._id), s.count])
      );
      const allSongs = await Song.find({ ...teamFilter, ...searchFilter }).lean();
      const neverUsedSongs: any[] = [];
      const rarelyUsedSongs: Array<{ song: any; count: number }> = [];
      allSongs.forEach((s: any) => {
        const count = songCountMap.get(String(s._id)) || 0;
        if (count === 0) neverUsedSongs.push(s);
        else if (count < 2) rarelyUsedSongs.push({ song: s, count });
      });
      rarelyUsedSongs.sort((a, b) => a.count - b.count);
      const allRareSongs = [
        ...neverUsedSongs,
        ...rarelyUsedSongs.map((item) => item.song),
      ];
      songs = allRareSongs.slice(0, limit);
    }

    return JSON.parse(JSON.stringify(songs)) as GettedSong[];
  } catch (error) {
    console.error("Failed to search songs:", error);
    return [] as GettedSong[];
  }
}

export async function getSongById(id: string): Promise<GettedSong> {
  try {
    await connectToDB();
    const song = await Song.findById(id)
      .populate({ path: "team", select: "name" })
      .populate({
        path: "copiedFrom",
        select: "title team",
        populate: { path: "team", select: "name" },
      })
      .lean();
    if (!song) throw new Error("Song not found");
    return mapSongDocument(song);
  } catch (error) {
    console.error("Failed to fetch song:", error);
    throw new Error("Failed to fetch song");
  }
}

export async function deleteSong(
  songId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const allowed = await canDeleteSong(songId);
    if (!allowed.ok) {
      return { success: false, error: allowed.message };
    }
    await connectToDB();

    // Отримуємо теги пісні перед видаленням
    const song = await Song.findById(songId).select("tags").lean();
    const songTags = parseTags((song as { tags?: string | string[] })?.tags);

    await Song.findByIdAndDelete(songId);

    // Декремент лічильників тегів
    if (songTags.length > 0) {
      await updateTagCounts(songTags, []);
    }

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
  tags: string[];
  comment: string;
  key: string;
  mode: string;
  origin: string;
  video: string;
  ourVideo: string;
  blocks: UpdatableBlock[];
}): Promise<{ success: true; song: GettedSong } | { success: false; error: string }> {
  try {
    const allowed = await canEditSong(String(formData._id));
    if (!allowed.ok) {
      return { success: false, error: allowed.message };
    }
    await connectToDB();

    // Отримуємо старі теги для порівняння
    const existingSong = await Song.findById(formData._id).select("tags").lean();
    const oldTags = parseTags((existingSong as { tags?: string | string[] })?.tags);
    const newTags = formData.tags.map(t => t.toLowerCase().trim()).filter(t => t.length > 0);

    const updated = await Song.findByIdAndUpdate(
      formData._id,
      {
        title: formData.title,
        comment: formData.comment,
        rythm: formData.rythm,
        tags: newTags,
        key: formData.key,
        mode: formData.mode,
        origin: formData.origin,
        video: formData.video,
        ourVideo: formData.ourVideo,
        blocks: formData.blocks,
      },
      { new: true, runValidators: true }
    );

    // Оновлюємо лічильники тегів
    await updateTagCounts(oldTags, newTags);

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
  tags: string[];
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
    const access = await canCreateSong();
    if (!access.ok) return { success: false, error: access.message };

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

    // Нормалізуємо теги
    const normalizedTags = formData.tags.map(t => t.toLowerCase().trim()).filter(t => t.length > 0);

    const newSong = new (Song as any)({
      title: formData.title,
      comment: formData.comment,
      rythm: formData.rythm,
      tags: normalizedTags,
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

    // Оновлюємо лічильники тегів (нова пісня — старих тегів немає)
    await updateTagCounts([], normalizedTags);

    const serialized = JSON.parse(JSON.stringify(newSong)) as GettedSong;
    const songId = (newSong as any)._id ? String((newSong as any)._id) : (serialized as any)._id;
    revalidatePath("/songs");
    return { success: true, song: serialized, songId };
  } catch (error) {
    console.error("Failed to create song:", error);
    return { success: false, error: "Failed to create song" };
  }
}

export async function getSongCopyContext(songId: string): Promise<SongCopyContext> {
  try {
    await connectToDB();
    const song = await Song.findById(songId)
      .select("_id team copiedFrom")
      .lean<Pick<GettedSong, "_id" | "team" | "copiedFrom">>();
    if (!song) {
      return {
        activeTeamId: null,
        canCopy: false,
        reason: "Пісню не знайдено",
        isSameTeam: false,
        hasActiveTeam: false,
        alreadyCopiedSongId: null,
        alreadyCopiedSongTitle: undefined,
        sourceTeamId: null,
        sourceTeamName: null,
      };
    }

    const sourceTeamId = song.team ? String(song.team) : null;
    const sourceTeam = sourceTeamId
      ? await Team.findById(sourceTeamId)
          .select("name settings")
          .lean<Pick<TeamInfo, "name" | "settings">>()
      : null;
    const allowCopying = sourceTeam?.settings?.allowCopying !== false;

    const baseContext: SongCopyContext = {
      activeTeamId: null,
      canCopy: false,
      reason: undefined,
      isSameTeam: false,
      hasActiveTeam: false,
      alreadyCopiedSongId: null,
      alreadyCopiedSongTitle: undefined,
      sourceTeamId,
      sourceTeamName: sourceTeam?.name ?? null,
    };

    const activeTeamAccess = await requireActiveTeam();
    if (!activeTeamAccess.ok) {
      return {
        ...baseContext,
        reason: activeTeamAccess.message,
      };
    }

    const activeTeamId = activeTeamAccess.teamId;
    const context: SongCopyContext = {
      ...baseContext,
      activeTeamId,
      hasActiveTeam: true,
    };

    // 1. Check if it's the same team
    if (sourceTeamId && sourceTeamId === activeTeamId) {
      return {
        ...context,
        isSameTeam: true,
        reason: "Пісня вже належить вашій активній команді",
      };
    }

    // 2. Check if original is in the team
    if (song.copiedFrom) {
      const originalSong = await Song.findById(song.copiedFrom)
        .select("_id team title")
        .lean<Pick<GettedSong, "_id" | "team" | "title">>();
      if (originalSong && originalSong.team && String(originalSong.team) === activeTeamId) {
        return {
          ...context,
          alreadyCopiedSongId: String(originalSong._id),
          alreadyCopiedSongTitle: originalSong.title,
          reason: "Оригінал цієї пісні вже належить вашій активній команді",
        };
      }
    }

    // 3. Check if we already have a copy
    const existingCopy = await Song.findOne({
      team: activeTeamId,
      copiedFrom: song._id,
    })
      .select("_id title")
      .lean<Pick<GettedSong, "_id" | "title">>();

    if (existingCopy) {
      return {
        ...context,
        alreadyCopiedSongId: String(existingCopy._id),
        alreadyCopiedSongTitle: existingCopy.title,
        reason: "Ця пісня вже скопійована у вашу команду",
      };
    }

    // 4. Check permissions and source settings
    const createAccess = await canCreateSong();
    if (!createAccess.ok) {
      return {
        ...context,
        reason: createAccess.message,
      };
    }

    if (sourceTeamId && !allowCopying) {
      return {
        ...context,
        reason: "Команда-джерело заборонила копіювання",
      };
    }

    return {
      ...context,
      canCopy: true,
    };
  } catch (error) {
    console.error("Failed to build copy context:", error);
    return {
      activeTeamId: null,
      canCopy: false,
      reason: "Не вдалося визначити можливість копіювання",
      isSameTeam: false,
      hasActiveTeam: false,
      alreadyCopiedSongId: null,
      alreadyCopiedSongTitle: undefined,
      sourceTeamId: null,
      sourceTeamName: null,
    };
  }
}

export async function copySongToActiveTeamAction(params: {
  songId: string;
  titleOverride?: string;
}): Promise<CopySongResult> {
  try {
    const access = await canCreateSong();
    if (!access.ok) {
      return { status: "forbidden", reason: access.message };
    }

    await connectToDB();
    const original = await Song.findById(params.songId)
      .lean<Pick<
        GettedSong,
        | "_id"
        | "title"
        | "team"
        | "blocks"
        | "comment"
        | "rythm"
        | "tags"
        | "key"
        | "mode"
        | "origin"
        | "video"
        | "ourVideo"
      >>();
    if (!original) {
      return { status: "error", message: "Пісню не знайдено" };
    }

    const sourceTeamId = original.team ? String(original.team) : null;
    if (sourceTeamId && sourceTeamId === access.teamId) {
      return { status: "same_team" };
    }

    if (sourceTeamId) {
      const sourceTeam = await Team.findById(sourceTeamId)
        .select("settings")
        .lean<Pick<TeamInfo, "settings">>();
      if (sourceTeam && sourceTeam.settings?.allowCopying === false) {
        return { status: "forbidden", reason: "Команда-джерело заборонила копіювання" };
      }
    }

    const existingCopy = await Song.findOne({ team: access.teamId, copiedFrom: original._id })
      .select("_id")
      .lean<Pick<GettedSong, "_id">>();
    if (existingCopy) {
      return { status: "already_copied", songId: String(existingCopy._id) };
    }

    const desiredTitle = (params.titleOverride?.trim() || original.title || "").trim();
    if (!desiredTitle) {
      return { status: "error", message: "Назва пісні не може бути порожньою" };
    }

    const duplicateByTitle = await Song.findOne({
      team: access.teamId,
      title: desiredTitle,
    })
      .select("_id title blocks team")
      .lean<Pick<GettedSong, "_id" | "title" | "blocks" | "team">>();

    if (duplicateByTitle) {
      let teamName: string | undefined;
      if (duplicateByTitle.team) {
        const teamDoc = await Team.findById(duplicateByTitle.team)
          .select("name")
          .lean<Pick<TeamInfo, "name">>();
        teamName = teamDoc?.name;
      }
      const previewBlocks = (duplicateByTitle.blocks ?? []).slice(0, 3);
      const preview: SongCopyConflictPreview = {
        id: String(duplicateByTitle._id),
        title: duplicateByTitle.title,
        teamName,
        blocks: previewBlocks,
      };
      return { status: "conflict", existing: preview };
    }

    const duplicatedBlocks = Array.isArray(original.blocks)
      ? original.blocks.map((block) => ({ ...block }))
      : [];

    // Парсимо теги з оригіналу
    const copiedTags = parseTags(original.tags);

    const newSong = new Song({
      title: desiredTitle,
      comment: original.comment || "",
      rythm: original.rythm || "",
      tags: copiedTags,
      key: original.key || "",
      mode: original.mode || "",
      origin: original.origin || "",
      video: original.video || "",
      ourVideo: original.ourVideo || "",
      blocks: duplicatedBlocks,
      team: access.teamId,
      createdBy: access.userId,
      copiedFrom: original._id,
      copiedBy: access.userId,
      copiedAt: new Date(),
      isOriginal: false,
    });

    await newSong.save();

    // Інкремент лічильників тегів для скопійованої пісні
    if (copiedTags.length > 0) {
      await updateTagCounts([], copiedTags);
    }

    revalidatePath("/songs");
    revalidatePath(`/songs/${String(newSong._id)}`);
    revalidatePath(`/songs/${params.songId}`);

    return { status: "success", songId: String(newSong._id), teamId: access.teamId };
  } catch (error) {
    console.error("Failed to copy song:", error);
    return { status: "error", message: "Не вдалося скопіювати пісню" };
  }
}
