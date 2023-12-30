import Event from "@/models/event";
import { connectToDB } from "@/utils/database";
import mongoose from "mongoose";
import { EventSong } from "@/types";

export const PUT = async (req: Request, res: Response) => {
  const { title, songs, date, _id, live } = await req.json();
  const songIds = songs.map(
    (song: { song: string }) => new mongoose.Types.ObjectId(song.song)
  );
  try {
    await connectToDB();
    const updatedEvent = await Event.findByIdAndUpdate(
      _id,
      {
        title,
        live,
        date: new Date(date),
        songs: songIds.map(
          (songId: mongoose.Types.ObjectId, index: number) => ({
            song: songId,
            comment: songs[index].comment,
            ind: songs[index].ind,
            title: songs[index].title,
          })
        ),
      },
      { new: true, runValidators: true }
    );

    return new Response(JSON.stringify(updatedEvent), { status: 201 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to create new event", { status: 500 });
  }
};
