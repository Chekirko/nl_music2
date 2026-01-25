import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/configs/auth";
import { getTeamById } from "@/lib/actions/teamActions";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import TeamEditForm  from "@/components/Teams/TeamEditForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { teamId: string };
}

export default async function TeamEditPage({ params }: PageProps) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    redirect("/login-page");
  }

  const teamRes = await getTeamById(params.teamId);
  if (!teamRes.success || !teamRes.team) {
    redirect("/denied");
  }

  const team = teamRes.team;

  // Check if current user is admin
  await connectToDB();
  const currentUser = await User.findOne({ email: session.user.email }).select("_id").lean<{ _id: string }>();
  const currentUserId = currentUser ? String(currentUser._id) : null;
  
  const currentMember = team.members.find((m: any) => String(m.user) === currentUserId);
  const isAdmin = currentMember?.role === "admin" || team.owner === currentUserId;
  const isOwner = team.owner === currentUserId;

  if (!isAdmin) {
    redirect("/denied");
  }

  return (
    <div className="padding-x max-w-[1000px] mx-auto mt-10">
      <TeamEditForm team={team} isOwner={isOwner} />
    </div>
  );
}
