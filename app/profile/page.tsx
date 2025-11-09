import { getActiveTeamAction, getUserTeamsAction } from "@/lib/actions/teamActions";
import ProfileClient from "@/components/Profile/ProfileClient";
import { getServerSession } from "next-auth";
import { authConfig } from "@/configs/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authConfig as any);
  if (!session?.user?.email) {
    redirect("/login-page");
  }
  const active = await getActiveTeamAction();
  const activeTeamId = active && active.success && active.team ? (active.team as any).id : null;
  const tu = await getUserTeamsAction();
  const teams = tu.success ? (tu.teams as any) : ([] as Array<{ id: string; name: string }>);

  return (
    <div className="padding-x max-w-[900px] mx-auto mt-10">
      <ProfileClient activeTeamId={activeTeamId} teams={teams} />
    </div>
  );
}
