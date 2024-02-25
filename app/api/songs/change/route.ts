import Song from "@/models/song";
import { connectToDB } from "@/utils/database";

export const dynamic = "force-dynamic";

export const PUT = async (req: Request, res: Response) => {
  const {
    _id,
    title,
    rythm,
    tags,
    comment,
    key,
    mode,
    origin,
    video,
    ourVideo,
    blocks,
  } = await req.json();

  try {
    await connectToDB();

    const updatedSong = await Song.findByIdAndUpdate(
      _id,
      {
        title,
        comment,
        rythm,
        tags,
        key,
        mode,
        origin,
        video,
        ourVideo,
        blocks,
      },
      { new: true, runValidators: true }
    );

    return new Response(JSON.stringify(updatedSong), { status: 201 });
  } catch (error) {
    return new Response("Failed to create new song", { status: 500 });
  }
};
