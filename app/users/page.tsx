import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authConfig } from "@/configs/auth";
import { getActiveTeamAction } from "@/lib/actions/teamActions";
import { searchUsersAction } from "@/lib/actions/userActions";
import { connectToDB } from "@/utils/database";
import Team from "@/models/teams";
import Invitation from "@/models/invitation";
import User from "@/models/user";
import UsersSearchPageClient, { UserSearchItem } from "@/components/UsersSearchPageClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { q?: string };
}

export default async function UsersPage({ searchParams }: PageProps) {
  const session = (await getServerSession(authConfig)) as Session | null;
  if (!session?.user?.email) {
    redirect("/login-page");
  }

  const query = searchParams.q || "";

  const activeTeamRes = await getActiveTeamAction();
  const activeTeamId = activeTeamRes.success && activeTeamRes.team ? activeTeamRes.team.id : null;
  const activeTeamName = activeTeamRes.success && activeTeamRes.team ? activeTeamRes.team.name : null;

  let canInvite = false;
  let userId: string | null = null;
  let memberIds = new Set<string>();
  let pendingInviteIds = new Set<string>();

  if (activeTeamId) {
    await connectToDB();
    const userDoc = await User.findOne({ email: session.user.email }).select("_id").lean() as any;
    if (userDoc) {
      userId = String(userDoc._id);
      const team = await Team.findById(activeTeamId)
        .select("owner members.user members.role")
        .lean();
      if (team) {
        const ownerId = String((team as any).owner);
        const members = (team as any).members || [];
        memberIds = new Set<string>(members.map((m: any) => String(m.user)));
        const isOwner = ownerId === userId;
        const isAdminMember = members.some(
          (m: any) => String(m.user) === userId && m.role === "admin"
        );
        canInvite = isOwner || isAdminMember;

        const invitations = await Invitation.find({
          team: activeTeamId,
          status: "pending",
        })
          .select("to")
          .lean();
        pendingInviteIds = new Set<string>(
          invitations.map((i: any) => String(i.to))
        );
      }
    }
  }

  const searchRes = await searchUsersAction({ q: query });
  const rawUsers = searchRes.success ? (searchRes.users as any[]) : [];

  const users: UserSearchItem[] = rawUsers.map((u: any) => ({
    _id: String(u._id),
    name: u.name || "",
    email: u.email || "",
    isMember: activeTeamId ? memberIds.has(String(u._id)) : false,
    hasPendingInvite: activeTeamId ? pendingInviteIds.has(String(u._id)) : false,
  }));

  return (
    <UsersSearchPageClient
      initialUsers={users}
      activeTeamId={activeTeamId}
      activeTeamName={activeTeamName}
      canInvite={canInvite}
      initialQuery={query}
    />
  );
}

