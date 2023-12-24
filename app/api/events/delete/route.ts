import Event from "@/models/event";
import { connectToDB } from "@/utils/database";

export const DELETE = async (req: Request, res: Response) => {
  const { _id } = await req.json();
  console.log(_id);

  try {
    await connectToDB();
    const deletedEvent = await Event.findByIdAndDelete(_id, {
      new: true,
      runValidators: true,
    });

    return new Response(JSON.stringify(deletedEvent), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to delete event", { status: 500 });
  }
};
