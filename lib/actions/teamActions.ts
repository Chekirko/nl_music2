"use server";

import { getServerSession } from "next-auth";
import { authConfig } from "@/configs/auth";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Team from "@/models/teams";

export async function getActiveTeamAction() {
  const session = (await getServerSession(authConfig as any)) as any;
  if (!session?.user?.email) return { success: false as const };
  await connectToDB();
  const user = (await User.findOne({ email: session.user.email })
    .select("activeTeam")
    .lean()) as any;
  if (!user?.activeTeam) return { success: true as const, team: null };
  const team = (await Team.findById(user.activeTeam).select("name").lean()) as any;
  if (!team) return { success: true as const, team: null };
  return { success: true as const, team: { id: String(user.activeTeam), name: team.name } };
}

export async function getUserTeamsAction() {
  const session = (await getServerSession(authConfig as any)) as any;
  if (!session?.user?.email) return { success: false as const };
  await connectToDB();
  const user = (await User.findOne({ email: session.user.email })
    .select("teams")
    .lean()) as any;
  const ids: string[] = (user?.teams || []).map((t: any) => String(t));
  if (!ids.length) return { success: true as const, teams: [] as any[] };
  const teams = (await Team.find({ _id: { $in: ids } }).select("name").lean()) as any[];
  return { success: true as const, teams: teams.map((t) => ({ id: String(t._id), name: t.name })) };
}

export async function setActiveTeamAction(teamId: string) {
  const session = (await getServerSession(authConfig as any)) as any;
  if (!session?.user?.email) return { success: false as const, error: "Unauthorized" };
  await connectToDB();
  const user = (await User.findOne({ email: session.user.email })
    .select("_id teams")
    .lean()) as any;
  const isMember = (user?.teams || []).some((t: any) => String(t) === String(teamId));
  if (!isMember) return { success: false as const, error: "Not a team member" };
  await User.updateOne({ _id: user._id }, { $set: { activeTeam: teamId } });
  return { success: true as const };
}

