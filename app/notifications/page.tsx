import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authConfig } from "@/configs/auth";
import { getUserNotificationsAction } from "@/lib/actions/notificationActions";
import NotificationsPageClient from "@/components/NotificationsPageClient";
import type { Notification } from "@/types";
import { connectToDB } from "@/utils/database";
import Team from "@/models/teams";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = (await getServerSession(authConfig)) as Session | null;
  if (!session?.user?.email) {
    redirect("/login-page");
  }

  const res = await getUserNotificationsAction();
  const notifications: Notification[] = res.success ? (res.notifications as Notification[]) : [];

  // Дозаповнюємо назви команд для старих/неповних сповіщень
  const teamIdSet = new Set<string>();
  notifications.forEach((n) => {
    const data = (n as any).data || {};
    if (data.teamId && !data.teamName && typeof data.teamId === "string") {
      teamIdSet.add(data.teamId);
    }
  });

  if (teamIdSet.size > 0) {
    await connectToDB();
    const teamIds = Array.from(teamIdSet);
    const teams = await Team.find({ _id: { $in: teamIds } })
      .select("name")
      .lean();
    const map = new Map<string, string>();
    teams.forEach((t: any) => {
      map.set(String(t._id), t.name || "");
    });

    notifications.forEach((n) => {
      const data = (n as any).data || {};
      const id = data.teamId as string | undefined;
      if (id && !data.teamName) {
        const name = map.get(id);
        if (name) {
          (n as any).data = { ...data, teamName: name };
        }
      }
    });
  }

  return <NotificationsPageClient initialNotifications={notifications} />;
}
