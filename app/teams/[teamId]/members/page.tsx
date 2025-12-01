import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authConfig } from "@/configs/auth";
import { getTeamById, getTeamMembersWithDetailsAction } from "@/lib/actions/teamActions";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import TeamMembersPageClient from "@/components/TeamMembersPageClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { teamId: string };
}

export default async function TeamMembersPage({ params }: PageProps) {
  const session = (await getServerSession(authConfig)) as Session | null;
  if (!session?.user?.email) {
    redirect("/login-page");
  }

  const teamRes = await getTeamById(params.teamId);
  if (!teamRes.success || !teamRes.team) {
    redirect("/denied");
  }

  const team = teamRes.team;

  // Check if current user is a member of the team
  await connectToDB();
  const currentUser = await User.findOne({ email: session.user.email }).select("_id").lean<{ _id: string }>();
  const currentUserId = currentUser ? String(currentUser._id) : null;
  
  const currentMember = team.members.find((m: any) => String(m.user) === currentUserId);
  
  if (!currentMember) {
    // If not a member, redirect to the public team page
    redirect(`/teams/${params.teamId}`);
  }

  const isAdmin = currentMember.role === "admin" || team.owner === currentUserId;
  const isOwner = team.owner === currentUserId;

  // Fetch detailed members info
  const membersRes = await getTeamMembersWithDetailsAction(params.teamId);
  const members = membersRes.success ? membersRes.members : [];

  // Map to TeamMemberWithUser format expected by the client component
  const mappedMembers = members.map((m) => ({
    userId: m.id,
    name: m.name,
    email: m.email,
    role: m.role as "admin" | "editor" | "member",
    isOwner: team.owner === m.id,
    isCurrentUser: currentUserId === m.id,
  }));

  return (
    <TeamMembersPageClient
      teamId={team.id}
      teamName={team.name}
      members={mappedMembers}
      canManage={isAdmin}
      isOwner={isOwner}
    />
  );
}
