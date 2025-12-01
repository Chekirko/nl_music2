import { getActiveTeamAction, getUserTeamsAction } from "@/lib/actions/teamActions";
import ProfileClient from "@/components/Profile/ProfileClient";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authConfig } from "@/configs/auth";
import { redirect } from "next/navigation";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Team from "@/models/teams";

export const dynamic = "force-dynamic";

type TeamSummary = { id: string; name: string };

export default async function ProfilePage() {
  const session = (await getServerSession(authConfig)) as Session | null;
  if (!session?.user?.email) {
    redirect("/login-page");
  }

  await connectToDB();
  const user = await User.findOne({ email: session.user.email }).lean();
  
  if (!user) {
     redirect("/login-page");
  }

  const active = await getActiveTeamAction();
  const activeTeamId = active?.success && active.team ? active.team.id : null;
  const tu = await getUserTeamsAction();
  const teams: TeamSummary[] = tu.success ? tu.teams : [];

  let instrument = "";
  if (activeTeamId) {
    const team = await Team.findOne({ 
      _id: activeTeamId, 
      "members.user": user._id 
    }).select("members").lean();
    
    if (team) {
      const member = (team as any).members.find((m: any) => String(m.user) === String(user._id));
      if (member && member.instrument) {
        instrument = member.instrument;
      }
    }
  }

  const userData = {
    name: user.name,
    email: user.email,
    nickname: user.nickname || "",
    image: user.image || "",
    instrument: instrument
  };

  return (
    <div className="padding-x max-w-[900px] mx-auto mt-10">
      <ProfileClient 
        activeTeamId={activeTeamId} 
        teams={teams} 
        initialUser={userData}
      />
    </div>
  );
}
