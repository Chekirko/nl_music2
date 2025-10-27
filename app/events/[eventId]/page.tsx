import { getSongs } from "@/lib/actions/songActions";
import { getEventById } from "@/lib/actions/eventActions";
import SingleEventClient from "@/components/Events/SingleEventClient";

interface SingleEventPageProps {
  params: {
    eventId: string;
  };
}

const SingleEventPage = async ({ params }: SingleEventPageProps) => {
  const { songs } = await getSongs("all");
  const event = await getEventById(params.eventId);
  return <SingleEventClient initialEvent={event} initialSongs={songs} />;
};

export default SingleEventPage;
