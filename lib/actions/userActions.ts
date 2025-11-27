"use server";

import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Team from "@/models/teams";
import Invitation from "@/models/invitation";
import { getSessionUser } from "@/lib/permissions";

export async function searchUsersAction(params: {
  q: string;
  limit?: number;
}) {
  try {
    const current = await getSessionUser();
    if (!current) {
      return { success: false as const, error: "Необхідна авторизація", users: [] as any[] };
    }

    const query = params.q?.trim();
    if (!query) {
      return { success: true as const, users: [] as any[] };
    }

    await connectToDB();

    const rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const users = await User.find({
      $or: [{ name: rx as any }, { email: rx as any }],
      _id: { $ne: current._id },
    })
      .select("_id name email activeTeam teams")
      .limit(params.limit ?? 20)
      .lean();

    return {
      success: true as const,
      users: JSON.parse(JSON.stringify(users)),
    };
  } catch (error) {
    console.error("searchUsersAction error", error);
    return { success: false as const, error: "Не вдалося виконати пошук", users: [] as any[] };
  }
}

export async function searchUsersForTeamAction(params: {
  teamId: string;
  q: string;
  limit?: number;
}) {
  try {
    const current = await getSessionUser();
    if (!current) {
      return {
        success: false as const,
        error: "Необхідна авторизація",
        users: [] as any[],
      };
    }

    const query = params.q?.trim();
    if (!query) {
      return { success: true as const, users: [] as any[] };
    }

    await connectToDB();

    const team = await Team.findById(params.teamId)
      .select("owner members.user")
      .lean();
    if (!team) {
      return {
        success: false as const,
        error: "Команду не знайдено",
        users: [] as any[],
      };
    }

    const memberIds = new Set<string>(
      ((team as any).members || []).map((m: any) => String(m.user))
    );

    const invitations = await Invitation.find({
      team: params.teamId,
      status: "pending",
    })
      .select("to")
      .lean();
    const pendingIds = new Set<string>(
      invitations.map((i: any) => String(i.to))
    );

    const rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const baseUsers = await User.find({
      $or: [{ name: rx as any }, { email: rx as any }],
      _id: { $ne: current._id },
    })
      .select("_id name email")
      .limit(params.limit ?? 20)
      .lean();

    const users = baseUsers.map((u: any) => ({
      _id: String(u._id),
      name: u.name || "",
      email: u.email || "",
      isMember: memberIds.has(String(u._id)),
      hasPendingInvite: pendingIds.has(String(u._id)),
    }));

    return {
      success: true as const,
      users,
    };
  } catch (error) {
    console.error("searchUsersForTeamAction error", error);
    return {
      success: false as const,
      error: "Не вдалося виконати пошук",
      users: [] as any[],
    };
  }
}

