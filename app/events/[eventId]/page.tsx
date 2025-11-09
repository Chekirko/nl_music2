
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
  if (!activeTeamId || !eventTeamId || activeTeamId !== eventTeamId) {
    redirect("/events");
  }

  const { songs } = await getSongs("all");
  return <SingleEventClient initialEvent={event} initialSongs={songs} />;
};

export default SingleEventPage;
