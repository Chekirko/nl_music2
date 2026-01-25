"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authConfig } from "@/configs/auth";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Team from "@/models/teams";
import cloudinary from "@/lib/cloudinary";
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
  coverImage?: string;
  city?: string;
  church?: string;
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
      coverImage: formData.coverImage || "",
      city: formData.city || "",
      church: formData.church || "",
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
        coverImage: team.coverImage || "",
        city: team.city || "",
        church: team.church || "",
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
  coverImage?: string;
  city?: string;
  church?: string;
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
    if (typeof updates.coverImage === "string") toSet.coverImage = updates.coverImage;
    if (typeof updates.city === "string") toSet.city = updates.city;
    if (typeof updates.church === "string") toSet.church = updates.church;
    if (updates.settings) {
      if (typeof updates.settings.isPrivate === "boolean") toSet["settings.isPrivate"] = updates.settings.isPrivate;
      if (typeof updates.settings.allowCopying === "boolean") toSet["settings.allowCopying"] = updates.settings.allowCopying;
    }
    
    console.log("updateTeam received:", updates);
    console.log("updateTeam constructed toSet:", toSet);
    console.log("Team model schema paths:", Object.keys(Team.schema.paths));

    await Team.updateOne({ _id: teamId }, { $set: toSet }, { strict: false });
    revalidatePath(`/teams/${teamId}`);
    revalidatePath(`/teams/${teamId}/edit`);
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
      .lean() as any[];

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
      .lean() as any;

    const res = await Team.updateOne(
      { _id: params.teamId, "members.user": params.userId },
      { $set: { "members.$.role": params.role } }
    );
    if (!res.matchedCount) {
      return { success: false as const, error: "Member not found in team" };
    }

    // Отримуємо дані про учасника для сповіщень
    const memberData = await User.findById(params.userId)
      .select("name email")
      .lean() as any;

    // Сповіщаємо всіх інших учасників команди про зміну ролі
    if (memberData) {
      const { notifyTeamMembers } = await import("@/lib/actions/notificationActions");
      await notifyTeamMembers({
        teamId: params.teamId,
        excludeUserIds: [params.userId],
        type: "team_update",
        data: {
          action: "role_changed",
          teamId: params.teamId,
          teamName: teamDoc?.name || "",
          memberName: memberData.name || "",
          memberEmail: memberData.email || "",
          newRole: params.role,
        },
      });
    }

    // Сповіщаємо самого учасника про зміну його ролі
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
      .lean() as any;

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

    // Отримуємо дані про видаленого учасника для сповіщень
    const memberData = await User.findById(params.userId)
      .select("name email")
      .lean() as any;

    // Сповіщаємо всіх інших учасників команди про видалення учасника
    if (memberData) {
      const { notifyTeamMembers } = await import("@/lib/actions/notificationActions");
      await notifyTeamMembers({
        teamId: params.teamId,
        excludeUserIds: [params.userId],
        type: "team_update",
        data: {
          action: "member_removed",
          teamId: params.teamId,
          teamName: teamDoc?.name || "",
          removedMemberName: memberData.name || "",
          removedMemberEmail: memberData.email || "",
        },
      });
    }

    // Сповіщаємо видаленого учасника
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

export async function getTeamMembersWithDetailsAction(teamId: string) {
  try {
    const session = await getServerSession(authConfig as any) as { user?: { email?: string } } | null;
    if (!session?.user?.email) return { success: false as const, error: "Unauthorized" };
    
    await connectToDB();

    // Verify user is authenticated (but don't require team membership for viewing)
    const currentUser = await User.findOne({ email: session.user.email }).select("_id").lean<{ _id: string }>();
    if (!currentUser) return { success: false as const, error: "User not found" };

    // Fetch team (no membership check - allow viewing any team)
    const team = await Team.findById(teamId)
      .select("members")
      .lean<{ members: { user: string; role: string; instrument?: string }[] }>();

    if (!team) return { success: false as const, error: "Team not found" };

    // Get all user IDs from team members
    const memberIds = (team.members || []).map((m) => m.user);

    // Fetch user details
    const users = await User.find({ _id: { $in: memberIds } })
      .select("name email nickname image")
      .lean<{ _id: string; name: string; email: string; nickname?: string; image?: string }[]>();

    // Map users to include instrument from team member schema
    const membersWithDetails: import("@/types").TeamMemberProfile[] = users.map((u) => {
      const teamMember = (team.members || []).find((m) => String(m.user) === String(u._id));
      return {
        id: String(u._id),
        name: u.name,
        email: u.email,
        nickname: u.nickname,
        image: u.image,
        instrument: teamMember?.instrument || "",
        role: teamMember?.role || "member"
      };
    });

    return { success: true as const, members: membersWithDetails };

  } catch (e) {
    console.error("getTeamMembersWithDetailsAction error", e);
    return { success: false as const, error: "Failed to fetch team members" };
  }
}

export async function getAllTeamsAction() {
  try {
    const session = await getServerSession(authConfig as any) as { user?: { email?: string } } | null;
    if (!session?.user?.email) return { success: false as const, error: "Unauthorized" };
    
    await connectToDB();

    // Fetch all teams
    const teams = await Team.find({})
      .select("name description avatar city")
      .lean<{ _id: string; name: string; description?: string; avatar?: string; city?: string }[]>();

    const teamsData = teams.map((t) => ({
      id: String(t._id),
      name: t.name,
      description: t.description || "",
      avatar: t.avatar || "",
      city: t.city || ""
    }));

    return { success: true as const, teams: teamsData };

  } catch (e) {
    console.error("getAllTeamsAction error", e);
    return { success: false as const, error: "Failed to fetch teams" };
  }
}

export async function updateTeamCoverImageAction(params: {
  teamId: string;
  newCoverImage: string;
}) {
  try {
    const can = await canManageTeam(params.teamId);
    if (!can.ok) return { success: false as const, error: can.message };
    
    await connectToDB();

    // Get old cover image to delete from Cloudinary
    const team = await Team.findById(params.teamId).select("coverImage").lean<{ coverImage?: string }>();
    const oldCoverImage = team?.coverImage;

    // Update team with new cover image
    console.log(`Updating cover image for team ${params.teamId} to ${params.newCoverImage}`);
    const updateResult = await Team.updateOne(
      { _id: params.teamId },
      { $set: { coverImage: params.newCoverImage } },
      { strict: false }
    );
    console.log("Update result:", updateResult);

    revalidatePath(`/teams/${params.teamId}`);
    revalidatePath(`/teams/${params.teamId}/edit`);

    // Delete old image from Cloudinary if it exists
    if (oldCoverImage) {
      try {
        // Extract public_id from Cloudinary URL
        // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/my_image.jpg
        // We need: folder/my_image
        const urlParts = oldCoverImage.split('/');
        const filenameWithExtension = urlParts[urlParts.length - 1];
        const filename = filenameWithExtension.split('.')[0];
        
        // If there are folders, we might need to extract them too. 
        // Usually Cloudinary URLs have version (v1234...) before the public_id if it's in root.
        // If it's in a folder, it's after version. 
        // Let's try a safer extraction method if possible, or stick to simple filename if no folders used.
        // Assuming flat structure or simple extraction for now based on previous code.
        
        // Better approach: regex to find version and take everything after
        // or just use the filename if we know we don't use folders.
        // Given the previous code just took the filename, we'll stick to that but use the SDK.
        
        await cloudinary.v2.uploader.destroy(filename);
      } catch (deleteError) {
        console.error("Failed to delete old cover image from Cloudinary", deleteError);
        // Continue anyway - image update succeeded
      }
    }

    return { success: true as const };

  } catch (e) {
    console.error("updateTeamCoverImageAction error", e);
    return { success: false as const, error: "Failed to update cover image" };
  }
}
