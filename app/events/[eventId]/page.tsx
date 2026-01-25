
import { getSongs } from "@/lib/actions/songActions";
import { getEventById } from "@/lib/actions/eventActions";
import SingleEventClient from "@/components/Events/SingleEventClient";
import { getActiveTeamAction } from "@/lib/actions/teamActions";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/configs/auth";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Team from "@/models/teams";

interface SingleEventPageProps {
  params: {
    eventId: string;
  };
}

const SingleEventPage = async ({ params }: SingleEventPageProps) => {
  const session = await getServerSession(authConfig);
  
  // Must be logged in to view any event
  if (!session?.user?.email) {
    redirect("/login-page");
  }

  const event = await getEventById(params.eventId);
  const eventTeamId = (event as any)?.team ? String((event as any).team) : null;
  const isPublic = (event as any)?.isPublic === true;

  const active = await getActiveTeamAction();
  const activeTeamId = active && active.success && active.team ? (active.team as any).id : null;
  
  // Check if user is a member of this event's team
  let isTeamMember = false;
  let canTogglePublic = false;
  
  if (eventTeamId) {
    await connectToDB();
    const user = await User.findOne({ email: session.user.email }).select("_id").lean() as { _id: any } | null;
    if (user) {
      const team = await Team.findOne({ 
        _id: eventTeamId, 
        "members.user": user._id 
      }).select("members owner").lean() as any;
      
      if (team) {
        isTeamMember = true;
        const member = team.members?.find((m: any) => String(m.user) === String(user._id));
        const isOwner = team.owner && String(team.owner) === String(user._id);
        // Admin, editor or owner can toggle public
        canTogglePublic = isOwner || member?.role === "admin" || member?.role === "editor";
      }
    }
  }

  // Access control
  if (eventTeamId) {
    if (!isTeamMember && !isPublic) {
      // Not a member and event is not public
      redirect("/events");
    }
  }

  // Get songs - for team members get team songs, otherwise empty (guests can't add songs)
  let songsResponse;
  if (isTeamMember && activeTeamId === eventTeamId) {
    songsResponse = await getSongs("all", 1, undefined, "team");
  } else {
    // Guest viewing public event - no songs to add
    songsResponse = { songs: [] };
  }
  const { songs } = songsResponse;
  
  return (
    <SingleEventClient 
      initialEvent={event} 
      initialSongs={songs}
      isTeamMember={isTeamMember}
      canTogglePublic={canTogglePublic}
    />
  );
};

export default SingleEventPage;

