"use server";

import { getServerSession } from "next-auth";
import { authConfig } from "@/configs/auth";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Team from "@/models/teams";
import Event from "@/models/event";
import { canManageTeam } from "@/lib/permissions";
import { createNotificationAction } from "@/lib/actions/notificationActions";

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

    // Витягуємо всіх користувачів команди
    const members = await User.find({ teams: teamId })
      .select("_id activeTeam")
      .lean();

    // Прибираємо команду з масиву команд у всіх користувачів
    await User.updateMany({ teams: teamId }, { $pull: { teams: teamId } });

    // Обнуляємо activeTeam, якщо вона вказувала на цю команду
    const usersWithActiveTeam = members
      .filter((u: any) => String(u.activeTeam) === String(teamId))
      .map((u: any) => u._id);
    if (usersWithActiveTeam.length) {
      await User.updateMany(
        { _id: { $in: usersWithActiveTeam } },
        { $unset: { activeTeam: 1 } }
      );
    }

    // Видаляємо саму команду
    await Team.deleteOne({ _id: teamId });

    // Видаляємо всі події (списки) цієї команди
    await Event.deleteMany({ team: teamId });

    return { success: true as const };
  } catch (e) {
    console.error("deleteTeam error", e);
    return { success: false as const, error: "Failed to delete team" };
  }
}

export async function updateTeamMemberRoleAction(params: {
  teamId: string;
  userId: string;
  role: "admin" | "editor" | "member";
}) {
  try {
    const can = await canManageTeam(params.teamId);
    if (!can.ok) return { success: false as const, error: can.message };
    await connectToDB();

    const validRoles = ["admin", "editor", "member"];
    if (!validRoles.includes(params.role)) {
      return { success: false as const, error: "Invalid role" };
    }

    const teamDoc = await Team.findById(params.teamId)
      .select("name")
      .lean();

    const res = await Team.updateOne(
      { _id: params.teamId, "members.user": params.userId },
      { $set: { "members.$.role": params.role } }
    );
    if (!res.matchedCount) {
      return { success: false as const, error: "Member not found in team" };
    }

    await createNotificationAction({
      userId: params.userId,
      type: "role_change",
      data: {
        teamId: params.teamId,
        teamName: teamDoc?.name || "",
        role: params.role,
      },
    });

    return { success: true as const };
  } catch (e) {
    console.error("updateTeamMemberRoleAction error", e);
    return { success: false as const, error: "Failed to update member role" };
  }
}

export async function removeTeamMemberAction(params: {
  teamId: string;
  userId: string;
}) {
  try {
    const can = await canManageTeam(params.teamId);
    if (!can.ok) return { success: false as const, error: can.message };
    await connectToDB();

    const teamDoc = await Team.findById(params.teamId)
      .select("name")
      .lean();

    const res = await Team.updateOne(
      { _id: params.teamId },
      { $pull: { members: { user: params.userId } } }
    );
    if (!res.modifiedCount) {
      return { success: false as const, error: "Member not found in team" };
    }

    await User.updateOne(
      { _id: params.userId },
      { $pull: { teams: params.teamId } }
    );
    await User.updateOne(
      { _id: params.userId, activeTeam: params.teamId },
      { $unset: { activeTeam: "" } }
    );

    await createNotificationAction({
      userId: params.userId,
      type: "removed_from_team",
      data: {
        teamId: params.teamId,
        teamName: teamDoc?.name || "",
      },
    });

    return { success: true as const };
  } catch (e) {
    console.error("removeTeamMemberAction error", e);
    return { success: false as const, error: "Failed to remove member from team" };
  }
}
