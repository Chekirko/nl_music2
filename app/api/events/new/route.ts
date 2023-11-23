import Event from "@/models/event";
import { connectToDB } from "@/utils/database";
import mongoose from "mongoose";
import { EventSong } from "@/types";

export const POST = async (req: Request, res: Response) => {
  const { title, songs } = await req.json();
  console.log(title);
  console.log(songs);
  const songIds = songs.map(
    (song: { song: string }) => new mongoose.Types.ObjectId(song.song)
  );
  console.log(songIds);
  try {
    await connectToDB();
    const newEvent = new Event({
      title,
      songs: songIds.map((songId: mongoose.Types.ObjectId, index: number) => ({
        song: songId,
        comment: songs[index].comment,
        ind: songs[index].ind,
        title: songs[index].title,
      })),
    });

    await newEvent.save();

    return new Response(JSON.stringify(newEvent), { status: 201 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to create new event", { status: 500 });
  }
};
