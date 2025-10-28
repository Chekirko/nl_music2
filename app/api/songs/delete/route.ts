import Song from "@/models/song";
import { connectToDB } from "@/utils/database";
import { getServerSession } from "next-auth";
import { authConfig } from "@/configs/auth";

export const DELETE = async (req: Request) => {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user?.role !== "admin") {
      return new Response("Access denied", { status: 403 });
    }
    const { _id } = await req.json();
    if (!_id) {
      return new Response("ID not provided", { status: 400 });
    }
    await connectToDB();
    await Song.findByIdAndDelete(_id);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Failed to delete song", { status: 500 });
  }
};
