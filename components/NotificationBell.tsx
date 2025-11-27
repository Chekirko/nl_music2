"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserNotificationsAction } from "@/lib/actions/notificationActions";
import { BellIcon } from "@heroicons/react/24/outline";

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getUserNotificationsAction({ onlyUnread: true });
        if (!cancelled && res.success) {
          const notifications = (res as any).notifications as Array<any>;
          setUnreadCount(notifications.length || 0);
        }
      } catch {
        if (!cancelled) {
          setUnreadCount(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    const onFocus = () => load();
    const onChanged = () => load();
    if (typeof window !== "undefined") {
      window.addEventListener("focus", onFocus);
      window.addEventListener("notifications-changed", onChanged as any);
    }
    return () => {
      cancelled = true;
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", onFocus);
        window.removeEventListener("notifications-changed", onChanged as any);
      }
    };
  }, []);

  const showDot = !loading && unreadCount > 0;

  return (
    <Link
      href="/notifications"
      className="relative inline-flex items-center justify-center rounded-full border border-blue-500 text-blue-100 px-3 py-1.5 text-sm hover:bg-blue-600/10"
      title={showDot ? `Непрочитані сповіщення: ${unreadCount}` : "Сповіщення"}
    >
      <BellIcon className="w-5 h-5 mr-1" />
      <span className="hidden md:inline">Сповіщення</span>
      {showDot && (
        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs min-w-[1.25rem] h-5 px-1">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
