
import { getSongs } from "@/lib/actions/songActions";
import { getEventById } from "@/lib/actions/eventActions";
import SingleEventClient from "@/components/Events/SingleEventClient";
import { getActiveTeamAction } from "@/lib/actions/teamActions";
import { redirect } from "next/navigation";

interface SingleEventPageProps {
  params: {
    eventId: string;
  };
}

const SingleEventPage = async ({ params }: SingleEventPageProps) => {
  const event = await getEventById(params.eventId);
  const active = await getActiveTeamAction();
  const activeTeamId = active && active.success && active.team ? (active.team as any).id : null;
  const eventTeamId = (event as any)?.team ? String((event as any).team) : null;

  let songsResponse;
  if (eventTeamId) {
    if (!activeTeamId || activeTeamId !== eventTeamId) {
      redirect("/events");
    }
    songsResponse = await getSongs("all", 1, undefined, "team");
  } else {
    songsResponse = await getSongs("all");
  }
  const { songs } = songsResponse;
  return <SingleEventClient initialEvent={event} initialSongs={songs} />;
};

export default SingleEventPage;
