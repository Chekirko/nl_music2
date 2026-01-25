import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authConfig } from "@/configs/auth";
import { getTeamById, getTeamMembersWithDetailsAction, getActiveTeamAction } from "@/lib/actions/teamActions";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import TeamProfile from "@/components/TeamProfile";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { teamId: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const teamRes = await getTeamById(params.teamId);
    if (!teamRes.success || !teamRes.team) {
      return { title: "Команда" };
    }
    const team = teamRes.team;
    return {
      title: team.name,
      description: `${team.name}${team.city ? ` — ${team.city}` : ""}. ${team.description || "Команда прославлення"}`,
      openGraph: {
        title: `${team.name} | NL Songs`,
        description: team.description || `Команда прославлення ${team.name}`,
      },
    };
  } catch {
    return { title: "Команда" };
  }
}

export default async function TeamPage({ params }: PageProps) {
  const session = (await getServerSession(authConfig)) as Session | null;
  if (!session?.user?.email) {
    redirect("/login-page");
  }

  const teamRes = await getTeamById(params.teamId);
  if (!teamRes.success || !teamRes.team) {
    redirect("/denied");
  }

  const team = teamRes.team;

  const membersRes = await getTeamMembersWithDetailsAction(params.teamId);
  const members = membersRes.success ? membersRes.members : [];

  // Check if this is the user's active team
  const activeTeamRes = await getActiveTeamAction();
  const isActiveTeam = activeTeamRes.success && activeTeamRes.team?.id === params.teamId;

  // Check if current user is admin
  await connectToDB();
  const currentUser = await User.findOne({ email: session.user.email }).select("_id").lean<{ _id: string }>();
  const currentUserId = currentUser ? String(currentUser._id) : null;
  
  const currentMember = team.members.find((m: any) => String(m.user) === currentUserId);
  const isAdmin = currentMember?.role === "admin" || team.owner === currentUserId;

  return (
    <TeamProfile
      teamName={team.name}
      teamDescription={team.description}
      teamCity={team.city}
      teamChurch={team.church}
      members={members}
      isAdmin={isAdmin}
      isActiveTeam={isActiveTeam}
      teamId={team.id}
    />
  );
}
