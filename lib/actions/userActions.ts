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



export async function updateProfileAction(params: {
  name?: string;
  nickname?: string;
  image?: string;
  instrument?: string;
  activeTeamId?: string | null;
}) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false as const, error: "Unauthorized" };
    }

    await connectToDB();

    const user = await User.findById(session._id);
    if (!user) {
      return { success: false as const, error: "User not found" };
    }

    // Handle Cloudinary image deletion if image is changed
    if (params.image && user.image && user.image !== params.image) {
      try {
        const cloudinary = await import("cloudinary");
        cloudinary.v2.config({
          cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        // Extract public_id from the old image URL
        const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/;
        const match = user.image.match(regex);
        if (match && match[1]) {
           await cloudinary.v2.uploader.destroy(match[1]);
        }
      } catch (err) {
        console.error("Failed to delete old image from Cloudinary:", err);
      }
    }

    // Update User fields
    if (params.name) user.name = params.name;
    if (params.nickname !== undefined) user.nickname = params.nickname;
    if (params.image) user.image = params.image;

    await user.save();

    // Update Instrument in Active Team
    if (params.activeTeamId && params.instrument !== undefined) {
      const team = await Team.findOne({
        _id: params.activeTeamId,
        "members.user": user._id,
      });

      if (team) {
        await Team.updateOne(
          { _id: params.activeTeamId, "members.user": user._id },
          { $set: { "members.$.instrument": params.instrument } }
        );
      }
    }

    return { success: true as const };
  } catch (error) {
    console.error("updateProfileAction error", error);
    return { success: false as const, error: "Failed to update profile" };
  }
}

export async function getUserInstrumentAction(teamId: string) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false as const, error: "Unauthorized" };
    }

    await connectToDB();

    const team = await Team.findOne({
      _id: teamId,
      "members.user": session._id,
    }).select("members");

    if (!team) {
      return { success: false as const, error: "Team not found or not a member" };
    }

    const member = (team as any).members.find(
      (m: any) => String(m.user) === String(session._id)
    );

    return { success: true as const, instrument: member?.instrument || "" };
  } catch (error) {
    console.error("getUserInstrumentAction error", error);
    return { success: false as const, error: "Failed to fetch instrument" };
  }
}
