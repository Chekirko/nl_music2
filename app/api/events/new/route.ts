import Event from "@/models/event";
import { connectToDB } from "@/utils/database";
import mongoose from "mongoose";
import { EventSong } from "@/types";

export const POST = async (req: Request, res: Response) => {
  const { title, songs, date } = await req.json();
  console.log(date);
  const songIds = songs.map(
    (song: { song: string }) => new mongoose.Types.ObjectId(song.song)
  );
  try {
    await connectToDB();
    const newEvent = new Event({
      title,
      date: new Date(date),
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
