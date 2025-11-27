import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authConfig } from "@/configs/auth";
import { getTeamById } from "@/lib/actions/teamActions";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import { canManageTeam } from "@/lib/permissions";
import TeamMembersPageClient, { TeamMemberWithUser } from "@/components/TeamMembersPageClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { teamId: string };
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

  await connectToDB();
  const currentUserDoc = await User.findOne({ email: session.user.email })
    .select("_id")
    .lean() as any;
  const currentUserId = currentUserDoc ? String(currentUserDoc._id) : null;

  const ids = new Set<string>([
    team.owner,
    ...team.members.map((m: any) => m.user),
  ]);

  const users = await User.find({ _id: { $in: Array.from(ids) } })
    .select("_id name email")
    .lean();

  const userMap = new Map<string, { name: string; email: string }>();
  users.forEach((u: any) => {
    userMap.set(String(u._id), {
      name: u.name || "",
      email: u.email || "",
    });
  });

  const members: TeamMemberWithUser[] = team.members.map((m: any) => {
    const id = String(m.user);
    const meta = userMap.get(id) || { name: "", email: "" };
    return {
      userId: id,
      name: meta.name,
      email: meta.email,
      role: m.role,
      isOwner: id === team.owner,
      isCurrentUser: currentUserId ? id === currentUserId : false,
    };
  });

  const canManageRes = await canManageTeam(params.teamId);
  const canManage = !!canManageRes.ok;
  const isOwner = currentUserId ? currentUserId === team.owner : false;

  return (
    <TeamMembersPageClient
      teamId={team.id}
      members={members}
      canManage={canManage}
      isOwner={isOwner}
      teamName={team.name}
    />
  );
}
