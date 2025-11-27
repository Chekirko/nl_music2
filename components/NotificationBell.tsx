"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserNotificationsAction } from "@/lib/actions/notificationActions";
import { BellIcon } from "@heroicons/react/24/outline";

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let pollInterval: NodeJS.Timeout | null = null;
    
    const load = async () => {
      setLoading(true);
      try {
        const res = await getUserNotificationsAction({ onlyUnread: true });
        if (!cancelled && res.success) {
          const notifications = (res as any).notifications as Array<any>;
          setUnreadCount(notifications.length || 0);
        } else if (!cancelled && !res.success) {
          // If failed (e.g., not authenticated), set to 0
          setUnreadCount(0);
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);
        if (!cancelled) {
          setUnreadCount(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    // Initial load with small delay to ensure session is ready
    const initialTimeout = setTimeout(() => {
      if (!cancelled) {
        load();
      }
    }, 100);
    
    // Poll every 30 seconds for new notifications
    pollInterval = setInterval(() => {
      load();
    }, 30000);
    
    const onChanged = () => load();
    const onFocus = () => load();
    
    if (typeof window !== "undefined") {
      window.addEventListener("notifications-changed", onChanged as any);
      window.addEventListener("focus", onFocus);
    }
    
    return () => {
      cancelled = true;
      clearTimeout(initialTimeout);
      if (pollInterval) clearInterval(pollInterval);
      if (typeof window !== "undefined") {
        window.removeEventListener("notifications-changed", onChanged as any);
        window.removeEventListener("focus", onFocus);
      }
    };
  }, []);

  const handleClick = () => {
    router.push("/notifications");
    router.refresh(); // Refresh server data
  };

  const showDot = !loading && unreadCount > 0;

  return (
    <button
      onClick={handleClick}
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
    </button>
  );
};

export default NotificationBell;
