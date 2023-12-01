import Song from "@/models/song";
import { connectToDB } from "@/utils/database";

export const POST = async (req: Request, res: Response) => {
  const {
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
  } = await req.json();

  try {
    await connectToDB();
    const newSong = new Song({
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
    });

    await newSong.save();

    return new Response(JSON.stringify(newSong), { status: 201 });
  } catch (error) {
    return new Response("Failed to create new song", { status: 500 });
  }
};
