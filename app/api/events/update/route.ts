import Event from "@/models/event";
import { connectToDB } from "@/utils/database";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export const PUT = async (req: Request, res: Response) => {
  const { title, songs, date, _id, live, playList } = await req.json();
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
        playList,
        date: date ? new Date(date) : undefined,
        songs: songIds.map(
          (songId: mongoose.Types.ObjectId, index: number) => ({
            song: songId,
            comment: songs[index].comment,
            ind: String(index),
            title: songs[index].title,
          })
        ),
      },
      { new: true, runValidators: true }
    );

    // Invalidate relevant pages so server components refetch fresh data
    try {
      revalidatePath("/events");
      revalidatePath(`/events/${_id}`);
      revalidatePath("/events/update-event");
    } catch {}

    return new Response(JSON.stringify(updatedEvent), { status: 201 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to create new event", { status: 500 });
  }
};
