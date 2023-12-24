import Event from "@/models/event";
import { connectToDB } from "@/utils/database";

export const dynamic = "force-dynamic";

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const id = searchParams.get("id");
    if (!id) {
      return new Response("ID not provided", { status: 400 });
    }
    await connectToDB();

    const event = await Event.findById(id);

    if (!event) {
      return new Response("Song not found", { status: 404 });
    }

    return new Response(JSON.stringify(event), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch event", { status: 500 });
  }
};
