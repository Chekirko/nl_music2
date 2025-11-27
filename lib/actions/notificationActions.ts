"use server";

import { connectToDB } from "@/utils/database";
import Notification from "@/models/notification";
import { getSessionUser } from "@/lib/permissions";

type BasicResult =
  | { success: true }
  | { success: false; error: string };

export async function createNotificationAction(params: {
  userId: string;
  type: "team_invite" | "role_change" | "removed_from_team" | "team_update";
  data: any;
}): Promise<BasicResult> {
  try {
    await connectToDB();
    const notification = new Notification({
      user: params.userId,
      type: params.type,
      data: params.data,
    });
    await notification.save();
    return { success: true };
  } catch (error) {
    console.error("createNotificationAction error", error);
    return { success: false, error: "Не вдалося створити сповіщення" };
  }
}

export async function getUserNotificationsAction(params?: {
  onlyUnread?: boolean;
}) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false as const, error: "Необхідна авторизація" };
    }

    await connectToDB();

    const query: any = { user: user._id };
    if (params?.onlyUnread) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true as const,
      notifications: JSON.parse(JSON.stringify(notifications)),
    };
  } catch (error) {
    console.error("getUserNotificationsAction error", error);
    return { success: false as const, error: "Не вдалося отримати сповіщення" };
  }
}

export async function markNotificationAsReadAction(id: string): Promise<BasicResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "Необхідна авторизація" };
    }

    await connectToDB();

    const res = await Notification.updateOne(
      { _id: id, user: user._id },
      { $set: { isRead: true } }
    );
    if (!res.matchedCount) {
      return { success: false, error: "Сповіщення не знайдено" };
    }

    return { success: true };
  } catch (error) {
    console.error("markNotificationAsReadAction error", error);
    return { success: false, error: "Не вдалося оновити сповіщення" };
  }
}

export async function markInvitationNotificationHandledAction(id: string): Promise<BasicResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "Необхідна авторизація" };
    }

    await connectToDB();

    const res = await Notification.updateOne(
      { _id: id, user: user._id, type: "team_invite" },
      { $set: { isRead: true, "data.handled": true } }
    );
    if (!res.matchedCount) {
      return { success: false, error: "Сповіщення-запрошення не знайдено" };
    }

    return { success: true };
  } catch (error) {
    console.error("markInvitationNotificationHandledAction error", error);
    return { success: false, error: "Не вдалося оновити сповіщення" };
  }
}

export async function markAllNotificationsAsReadAction(): Promise<BasicResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "Необхідна авторизація" };
    }

    await connectToDB();

    await Notification.updateMany(
      { user: user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return { success: true };
  } catch (error) {
    console.error("markAllNotificationsAsReadAction error", error);
    return { success: false, error: "Не вдалося оновити сповіщення" };
  }
}

export async function deleteNotificationAction(id: string): Promise<BasicResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "Необхідна авторизація" };
    }

    await connectToDB();

    const res = await Notification.deleteOne({
      _id: id,
      user: user._id,
    });
    if (!res.deletedCount) {
      return { success: false, error: "Сповіщення не знайдено" };
    }

    return { success: true };
  } catch (error) {
    console.error("deleteNotificationAction error", error);
    return { success: false, error: "Не вдалося видалити сповіщення" };
  }
}
