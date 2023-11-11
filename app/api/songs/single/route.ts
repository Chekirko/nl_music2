import Song from "@/models/song";
import { connectToDB } from "@/utils/database";

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const id = searchParams.get("id");
    if (!id) {
      return new Response("ID not provided", { status: 400 });
    }
    await connectToDB();

    const song = await Song.findById(id);

    if (!song) {
      return new Response("Song not found", { status: 404 });
    }
    
    return new Response(JSON.stringify(song), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch all songs", { status: 500 });
  }
};
