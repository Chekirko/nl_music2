"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Notification } from "@/types";
import {
  acceptInvitationAction,
  declineInvitationAction,
} from "@/lib/actions/invitationActions";
import {
  markNotificationAsReadAction,
  deleteNotificationAction,
  markInvitationNotificationHandledAction,
} from "@/lib/actions/notificationActions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  initialNotifications: Notification[];
}

const NotificationsPageClient = ({ initialNotifications }: Props) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  const updateNotification = (id: string, patch: Partial<Notification>) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, ...patch } : n))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const handleMarkRead = async (id: string) => {
    setBusyId(id);
    try {
      const res = await markNotificationAsReadAction(id);
      if (res.success) {
        updateNotification(id, { isRead: true });
        if (typeof window !== "undefined") {
          try {
            window.dispatchEvent(new CustomEvent("notifications-changed"));
          } catch {
            // ignore
          }
        }
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      alert("Не вдалося оновити сповіщення");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      const res = await deleteNotificationAction(id);
      if (res.success) {
        removeNotification(id);
        router.refresh(); // Refresh server data
        if (typeof window !== "undefined") {
          try {
            window.dispatchEvent(new CustomEvent("notifications-changed"));
          } catch {
            // ignore
          }
        }
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error("Failed to delete notification", error);
      alert("Не вдалося видалити сповіщення");
    } finally {
      setBusyId(null);
    }
  };

  const handleTeamInvite = async (notification: Notification, action: "accept" | "decline") => {
    const data = notification.data || {};
    const invitationId = data.invitationId as string | undefined;
    if (!invitationId) {
      alert("Невірні дані запрошення");
      return;
    }
    setBusyId(notification._id);
    try {
      const res =
        action === "accept"
          ? await acceptInvitationAction(invitationId)
          : await declineInvitationAction(invitationId);
      if (res.success) {
        updateNotification(notification._id, {
          isRead: true,
          data: { ...(notification.data || {}), handled: true },
        });
        try {
          const markRes = await markInvitationNotificationHandledAction(notification._id);
          if (!markRes.success) {
            console.warn("Failed to mark invitation notification as handled:", markRes.error);
          }
        } catch (err) {
          console.warn("Error marking invitation notification as handled:", err);
        }
        if (typeof window !== "undefined") {
          try {
            window.dispatchEvent(new CustomEvent("notifications-changed"));
          } catch {
            // ignore
          }
        }
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error("Failed to handle team invite", error);
      alert("Не вдалося опрацювати запрошення");
    } finally {
      setBusyId(null);
    }
  };

  if (!notifications.length) {
    return (
      <div className="padding-x max-w-[900px] mx-auto mt-10">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Сповіщення</h1>
        <p className="text-gray-600">Наразі немає сповіщень.</p>
      </div>
    );
  }

  return (
    <div className="padding-x max-w-[900px] mx-auto mt-10">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Сповіщення</h1>
      <ul className="space-y-4">
        {notifications.map((n) => {
          const isInvite = n.type === "team_invite";
          const data = n.data || {};
          const isRead = n.isRead;
          const isHandledInvite = isInvite && (data as any).handled;
          const isBusy = busyId === n._id;
          const createdAt =
            n.createdAt instanceof Date
              ? n.createdAt.toLocaleString("uk-UA")
              : new Date(n.createdAt).toLocaleString("uk-UA");

          return (
            <li
              key={n._id}
              className={`border rounded-lg p-4 flex flex-col gap-2 ${
                isRead ? "bg-white/40 border-gray-200" : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-500">{createdAt}</div>
                {!isRead && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">
                    Нове
                  </span>
                )}
              </div>

              {isInvite ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    Вас запрошують до команди{" "}
                    {data.teamName ? (
                      <span className="font-semibold">{data.teamName}</span>
                    ) : (
                      <span className="font-semibold">(назва недоступна)</span>
                    )}
                    {data.fromUserName && (
                      <>
                        {" "}
                        (від {data.fromUserName}
                        {data.fromUserEmail ? `, ${data.fromUserEmail}` : ""})
                      </>
                    )}
                    .
                  </p>
                  {!isHandledInvite && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleTeamInvite(n, "accept")}
                        className="px-3 py-1.5 rounded bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-60"
                      >
                        Прийняти
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleTeamInvite(n, "decline")}
                        className="px-3 py-1.5 rounded border border-red-500 text-red-600 text-sm hover:bg-red-50 disabled:opacity-60"
                      >
                        Відхилити
                      </button>
                      {data.teamId && (
                        <Link
                          href={`/teams/${data.teamId}`}
                          className="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-50"
                        >
                          Переглянути команду
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ) : n.type === "role_change" ? (
                <div className="space-y-1">
                  <p className="text-sm">
                    Ваша роль{" "}
                    {data.teamName && (
                      <>
                        у команді{" "}
                        <span className="font-semibold">
                          {data.teamName}
                        </span>{" "}
                      </>
                    )}
                    змінена на{" "}
                    <span className="font-semibold">
                      {data.role === "admin"
                        ? "адмін"
                        : data.role === "editor"
                        ? "редактор"
                        : "учасник"}
                    </span>
                    .
                  </p>
                  {data.teamId && (
                    <Link
                      href={`/teams/${data.teamId}`}
                      className="inline-flex text-xs text-blue-700 hover:underline mt-1"
                    >
                      Перейти до команди
                    </Link>
                  )}
                </div>
              ) : n.type === "removed_from_team" ? (
                <div className="space-y-1">
                  <p className="text-sm">
                    Ви були видалені з{" "}
                    {data.teamName ? (
                      <>
                        команди{" "}
                        <span className="font-semibold">
                          {data.teamName}
                        </span>
                        .
                      </>
                    ) : (
                      <>команди, яка зараз недоступна.</>
                    )}
                  </p>
                </div>
              ) : n.type === "team_update" ? (
                <div className="space-y-1">
                  {data.action === "member_joined" ? (
                    <p className="text-sm">
                      Новий учасник{" "}
                      <span className="font-semibold">
                        {data.newMemberName || data.newMemberEmail || "користувач"}
                      </span>{" "}
                      приєднався до команди{" "}
                      {data.teamName && (
                        <span className="font-semibold">{data.teamName}</span>
                      )}
                      .
                    </p>
                  ) : data.action === "invitation_declined" ? (
                    <p className="text-sm">
                      Користувач{" "}
                      <span className="font-semibold">
                        {data.userName || data.userEmail || "користувач"}
                      </span>{" "}
                      відхилив запрошення до команди{" "}
                      {data.teamName && (
                        <span className="font-semibold">{data.teamName}</span>
                      )}
                      .
                    </p>
                  ) : data.action === "role_changed" ? (
                    <p className="text-sm">
                      Роль учасника{" "}
                      <span className="font-semibold">
                        {data.memberName || data.memberEmail || "користувач"}
                      </span>{" "}
                      у команді{" "}
                      {data.teamName && (
                        <span className="font-semibold">{data.teamName}</span>
                      )}{" "}
                      змінена на{" "}
                      <span className="font-semibold">
                        {data.newRole === "admin"
                          ? "адмін"
                          : data.newRole === "editor"
                          ? "редактор"
                          : "учасник"}
                      </span>
                      .
                    </p>
                  ) : data.action === "member_removed" ? (
                    <p className="text-sm">
                      Учасник{" "}
                      <span className="font-semibold">
                        {data.removedMemberName || data.removedMemberEmail || "користувач"}
                      </span>{" "}
                      був видалений з команди{" "}
                      {data.teamName && (
                        <span className="font-semibold">{data.teamName}</span>
                      )}
                      .
                    </p>
                  ) : (
                    <p className="text-sm">
                      Оновлення команди{" "}
                      {data.teamName && (
                        <span className="font-semibold">{data.teamName}</span>
                      )}
                      .
                    </p>
                  )}
                  {data.teamId && (
                    <Link
                      href={`/teams/${data.teamId}`}
                      className="inline-flex text-xs text-blue-700 hover:underline mt-1"
                    >
                      Перейти до команди
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm">
                    Системне сповіщення:{" "}
                    <span className="font-semibold">{n.type}</span>
                  </p>
                  <pre className="text-xs bg-gray-100 rounded p-2 overflow-auto max-h-40">
                    {JSON.stringify(n.data, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-2 justify-end mt-2">
                {!isRead && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleMarkRead(n._id)}
                    className="px-3 py-1 text-xs rounded border border-blue-400 text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                  >
                    Позначити як прочитане
                  </button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      disabled={isBusy}
                      className="px-3 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                    >
                      Видалити
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white max-sm:w-72">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Видалити сповіщення?</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm">
                        Це сповіщення буде остаточно видалено зі списку.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Відміна</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(n._id)}
                      >
                        Видалити
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default NotificationsPageClient;
