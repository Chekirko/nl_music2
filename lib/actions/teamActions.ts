"use server";

import { getServerSession } from "next-auth";
import { authConfig } from "@/configs/auth";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Team from "@/models/teams";
import { canManageTeam } from "@/lib/permissions";

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
    .select("_id teams")
    .lean()) as any;
  const ids: string[] = (user?.teams || []).map((t: any) => String(t));
  // Повертаємо команди і за user.teams, і за власністю/членством, щоб уникнути розсинхрону
  const query: any = {
    $or: [
      ...(ids.length ? [{ _id: { $in: ids } }] : []),
      { owner: user?._id },
      { "members.user": user?._id },
    ],
  };
  const teams = (await Team.find(query).select("name").lean()) as any[];
  // Дедуплікація на випадок перетину умов
  const map = new Map<string, any>();
  teams.forEach((t) => map.set(String(t._id), t));
  const unique = Array.from(map.values());
  return { success: true as const, teams: unique.map((t) => ({ id: String(t._id), name: t.name })) };
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

export async function createTeam(formData: {
  name: string;
  description?: string;
  avatar?: string;
  settings?: { isPrivate?: boolean; allowCopying?: boolean };
}) {
  try {
    const session = (await getServerSession(authConfig as any)) as any;
    if (!session?.user?.email) return { success: false as const, error: "Unauthorized" };
    await connectToDB();
    const user = (await User.findOne({ email: session.user.email }).select("_id teams activeTeam").lean()) as any;
    if (!user) return { success: false as const, error: "User not found" };

    const team = new (Team as any)({
      name: formData.name,
      description: formData.description || "",
      avatar: formData.avatar || "",
      owner: user._id,
      members: [
        {
          user: user._id,
          role: "admin",
          invitedBy: user._id,
          joinedAt: new Date(),
        },
      ],
      settings: {
        isPrivate: formData.settings?.isPrivate ?? false,
        allowCopying: formData.settings?.allowCopying ?? true,
      },
    });
    await team.save();

    await User.updateOne(
      { _id: user._id },
      {
        $addToSet: { teams: team._id },
        ...(user.activeTeam ? {} : { $set: { activeTeam: team._id } }),
      }
    );

    return { success: true as const, teamId: String(team._id) };
  } catch (e) {
    console.error("createTeam error", e);
    return { success: false as const, error: "Failed to create team" };
  }
}

export async function getTeamById(teamId: string) {
  try {
    await connectToDB();
    const team = (await Team.findById(teamId).lean()) as any;
    if (!team) return { success: false as const, error: "Team not found" };
    return {
      success: true as const,
      team: {
        id: String(team._id),
        name: team.name,
        description: team.description || "",
        avatar: team.avatar || "",
        owner: String(team.owner),
        members: (team.members || []).map((m: any) => ({ user: String(m.user), role: m.role })),
        settings: team.settings || { isPrivate: false, allowCopying: true },
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      },
    };
  } catch (e) {
    console.error("getTeamById error", e);
    return { success: false as const, error: "Failed to fetch team" };
  }
}

export async function getTeamMembers(teamId: string) {
  try {
    await connectToDB();
    const team = (await Team.findById(teamId)
      .select("members")
      .lean()) as any;
    if (!team) return { success: false as const, error: "Team not found" };
    const members = (team.members || []).map((m: any) => ({ user: String(m.user), role: m.role }));
    return { success: true as const, members };
  } catch (e) {
    console.error("getTeamMembers error", e);
    return { success: false as const, error: "Failed to fetch members" };
  }
}

export async function updateTeam(teamId: string, updates: {
  name?: string;
  description?: string;
  avatar?: string;
  settings?: { isPrivate?: boolean; allowCopying?: boolean };
}) {
  try {
    const can = await canManageTeam(teamId);
    if (!can.ok) return { success: false as const, error: can.message };
    await connectToDB();
    const toSet: any = {};
    if (typeof updates.name === "string") toSet.name = updates.name;
    if (typeof updates.description === "string") toSet.description = updates.description;
    if (typeof updates.avatar === "string") toSet.avatar = updates.avatar;
    if (updates.settings) {
      if (typeof updates.settings.isPrivate === "boolean") toSet["settings.isPrivate"] = updates.settings.isPrivate;
      if (typeof updates.settings.allowCopying === "boolean") toSet["settings.allowCopying"] = updates.settings.allowCopying;
    }
    await Team.updateOne({ _id: teamId }, { $set: toSet });
    return { success: true as const };
  } catch (e) {
    console.error("updateTeam error", e);
    return { success: false as const, error: "Failed to update team" };
  }
}

export async function deleteTeam(teamId: string) {
  try {
    const can = await canManageTeam(teamId);
    if (!can.ok) return { success: false as const, error: can.message };
    await connectToDB();

    // Pull team from all users and unset activeTeam where needed
    await User.updateMany({ teams: teamId }, { $pull: { teams: teamId } });
    await User.updateMany({ activeTeam: teamId }, { $unset: { activeTeam: 1 } });

    await Team.deleteOne({ _id: teamId });
    return { success: true as const };
  } catch (e) {
    console.error("deleteTeam error", e);
    return { success: false as const, error: "Failed to delete team" };
  }
}
