"use server";

import { connectToDB } from "@/utils/database";
import Invitation from "@/models/invitation";
import Team from "@/models/teams";
import User from "@/models/user";
import Notification from "@/models/notification";
import { getActiveTeamAndRole, getSessionUser } from "@/lib/permissions";
import { createNotificationAction } from "@/lib/actions/notificationActions";

type BasicResult =
  | { success: true }
  | { success: false; error: string };

export async function sendInvitationAction(params: {
  teamId: string;
  toUserId: string;
}): Promise<BasicResult> {
  try {
    const access = await getActiveTeamAndRole();
    if (!access.ok) {
      return { success: false, error: access.message };
    }
    if (access.teamId !== params.teamId) {
      return { success: false, error: "Можна запрошувати лише від активної команди" };
    }
    if (access.role !== "admin") {
      return { success: false, error: "Лише адміністратори можуть запрошувати до команди" };
    }

    await connectToDB();

    const [team, toUser, fromUser] = await Promise.all([
      Team.findById(params.teamId)
        .select("_id owner members.user name")
        .lean() as any,
      User.findById(params.toUserId).select("_id teams").lean() as any,
      User.findById(access.userId).select("_id name email").lean() as any,
    ]);

    if (!team) {
      return { success: false, error: "Команду не знайдено" };
    }
    if (!toUser) {
      return { success: false, error: "Користувача не знайдено" };
    }

    // Заборона запрошувати самого себе
    if (String(toUser._id) === String(access.userId)) {
      return { success: false, error: "Не можна запрошувати самого себе" };
    }

    // Якщо вже учасник команди
    const alreadyMember = ((team as any).members || []).some(
      (m: any) => String(m.user) === String(toUser._id)
    );
    if (alreadyMember) {
      return { success: false, error: "Користувач вже є учасником цієї команди" };
    }

    // Якщо вже є активне запрошення
    const existing = await Invitation.findOne({
      team: params.teamId,
      to: toUser._id,
      status: "pending",
    })
      .select("_id")
      .lean() as any;
    if (existing) {
      return { success: false, error: "Запрошення вже надіслано" };
    }

    const invitation = new Invitation({
      team: params.teamId,
      from: access.userId,
      to: toUser._id,
    });
    await invitation.save();

    // Створюємо сповіщення для запрошеного користувача
    if (fromUser) {
      await createNotificationAction({
        userId: String(toUser._id),
        type: "team_invite",
        data: {
          invitationId: String(invitation._id),
          teamId: String(team._id),
          teamName: (team as any).name || "",
          fromUserId: String(fromUser._id),
          fromUserName: (fromUser as any).name || "",
          fromUserEmail: (fromUser as any).email || "",
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("sendInvitationAction error", error);
    return { success: false, error: "Не вдалося надіслати запрошення" };
  }
}

export async function acceptInvitationAction(invitationId: string): Promise<BasicResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "Необхідна авторизація" };
    }

    await connectToDB();

    const invitation = await Invitation.findById(invitationId)
      .select("team to status")
      .lean() as any;
    if (!invitation) {
      return { success: false, error: "Запрошення не знайдено" };
    }
    if (String(invitation.to) !== String(user._id)) {
      return { success: false, error: "Ви не можете прийняти це запрошення" };
    }
    if (invitation.status !== "pending") {
      return { success: false, error: "Запрошення вже опрацьоване" };
    }

    const teamId = String(invitation.team);

    // Додаємо користувача в команду та команду в список користувача
    const [teamDoc, userDoc] = await Promise.all([
      Team.findById(teamId).select("members").lean() as any,
      User.findById(user._id).select("teams").lean() as any,
    ]);
    if (!teamDoc) {
      return { success: false, error: "Команду не знайдено" };
    }

    const isAlreadyMember = (teamDoc.members || []).some(
      (m: any) => String(m.user) === String(user._id)
    );

    const ops: Promise<any>[] = [];

    if (!isAlreadyMember) {
      ops.push(
        Team.updateOne(
          { _id: teamId },
          {
            $addToSet: {
              members: {
                user: user._id,
                role: "member",
                invitedBy: undefined,
                joinedAt: new Date(),
              },
            },
          }
        )
      );
    }

    const userTeams = (userDoc as any)?.teams || [];
    const hasTeam = userTeams.some(
      (t: any) => String(t) === String(teamId)
    );
    if (!hasTeam) {
      ops.push(
        User.updateOne(
          { _id: user._id },
          {
            $addToSet: { teams: teamId },
          }
        )
      );
    }

    ops.push(
      Invitation.updateOne(
        { _id: invitationId },
        { $set: { status: "accepted" } }
      )
    );

    await Promise.all(ops);

    // Отримуємо дані про нового учасника та команду для сповіщення
    const [newMemberData, teamData] = await Promise.all([
      User.findById(user._id).select("name email").lean() as any,
      Team.findById(teamId).select("name").lean() as any,
    ]);

    // Сповіщаємо всіх учасників команди про нового учасника
    if (newMemberData && teamData) {
      const { notifyTeamMembers } = await import("@/lib/actions/notificationActions");
      await notifyTeamMembers({
        teamId,
        excludeUserIds: [String(user._id)],
        type: "team_update",
        data: {
          action: "member_joined",
          teamId,
          teamName: teamData.name || "",
          newMemberName: newMemberData.name || "",
          newMemberEmail: newMemberData.email || "",
        },
      });
    }

    // Видаляємо всі сповіщення, пов'язані з цим запрошенням
    await Notification.deleteMany({
      type: "team_invite",
      "data.invitationId": invitationId,
    });

    return { success: true };
  } catch (error) {
    console.error("acceptInvitationAction error", error);
    return { success: false, error: "Не вдалося прийняти запрошення" };
  }
}

export async function declineInvitationAction(invitationId: string): Promise<BasicResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "Необхідна авторизація" };
    }

    await connectToDB();

    const invitation = await Invitation.findById(invitationId)
      .select("to status")
      .lean() as any;
    if (!invitation) {
      return { success: false, error: "Запрошення не знайдено" };
    }
    if (String(invitation.to) !== String(user._id)) {
      return { success: false, error: "Ви не можете відхилити це запрошення" };
    }
    if (invitation.status !== "pending") {
      return { success: false, error: "Запрошення вже опрацьоване" };
    }

    await Invitation.updateOne(
      { _id: invitationId },
      { $set: { status: "declined" } }
    );

    // Отримуємо дані про користувача та команду для сповіщення адміністраторів
    const [userData, teamData, invitationData] = await Promise.all([
      User.findById(user._id).select("name email").lean() as any,
      Team.findById((invitation as any).team).select("name owner members").lean() as any,
      Invitation.findById(invitationId).select("team").lean() as any,
    ]);

    // Сповіщаємо адміністраторів команди про відхилення запрошення
    if (userData && teamData && invitationData) {
      const teamId = String((invitationData as any).team);
      const adminIds: string[] = [];
      
      // Додаємо власника
      adminIds.push(String(teamData.owner));
      
      // Додаємо адміністраторів
      const members = teamData.members || [];
      for (const member of members) {
        if (member.role === "admin") {
          adminIds.push(String(member.user));
        }
      }
      
      // Створюємо сповіщення для кожного адміністратора
      const notifications = adminIds.map(adminId => ({
        user: adminId,
        type: "team_update" as const,
        data: {
          action: "invitation_declined",
          teamId,
          teamName: teamData.name || "",
          userName: userData.name || "",
          userEmail: userData.email || "",
        },
      }));
      
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    await Notification.deleteMany({
      type: "team_invite",
      "data.invitationId": invitationId,
    });

    return { success: true };
  } catch (error) {
    console.error("declineInvitationAction error", error);
    return { success: false, error: "Не вдалося відхилити запрошення" };
  }
}

export async function cancelInvitationAction(invitationId: string): Promise<BasicResult> {
  try {
    const access = await getActiveTeamAndRole();
    if (!access.ok) {
      return { success: false, error: access.message };
    }

    await connectToDB();

    const invitation = await Invitation.findById(invitationId)
      .select("team from status")
      .lean() as any;
    if (!invitation) {
      return { success: false, error: "Запрошення не знайдено" };
    }
    if (invitation.status !== "pending") {
      return { success: false, error: "Запрошення вже опрацьоване" };
    }

    const isSender = String(invitation.from) === String(access.userId);
    const sameTeam = String(invitation.team) === String(access.teamId);
    const isAdmin = access.role === "admin";

    if (!isSender && !(sameTeam && isAdmin)) {
      return { success: false, error: "Недостатньо прав для скасування запрошення" };
    }

    await Invitation.updateOne(
      { _id: invitationId },
      { $set: { status: "cancelled" } }
    );

    return { success: true };
  } catch (error) {
    console.error("cancelInvitationAction error", error);
    return { success: false, error: "Не вдалося скасувати запрошення" };
  }
}

export async function getUserInvitationsAction(params?: {
  direction?: "incoming" | "outgoing" | "all";
}) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false as const, error: "Необхідна авторизація" };
    }

    await connectToDB();

    const direction = params?.direction || "incoming";
    const query: any = {};

    if (direction === "incoming") {
      query.to = user._id;
    } else if (direction === "outgoing") {
      query.from = user._id;
    } else {
      query.$or = [{ to: user._id }, { from: user._id }];
    }

    const invitations = await Invitation.find(query)
      .sort({ createdAt: -1 })
      .lean() as any[];

    return {
      success: true as const,
      invitations: JSON.parse(JSON.stringify(invitations)),
    };
  } catch (error) {
    console.error("getUserInvitationsAction error", error);
    return { success: false as const, error: "Не вдалося отримати запрошення" };
  }
}
