import Event from "@/models/event";
import { connectToDB } from "@/utils/database";

export const dynamic = "force-dynamic";

export const GET = async (request: Request) => {
  try {
    await connectToDB();

    const events = await Event.find({});
    return new Response(JSON.stringify(events), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch all events", { status: 500 });
  }
};
