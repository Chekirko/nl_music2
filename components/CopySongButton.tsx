"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type { SongCopyContext, SongCopyConflictPreview } from "@/types";
import { copySongToActiveTeamAction, getSongCopyContext } from "@/lib/actions/songActions";
import CopySongConflictDialog from "./CopySongConflictDialog";

interface CopySongButtonProps {
  songId: string;
  songTitle: string;
  initialContext: SongCopyContext;
  isOriginalSong?: boolean;
}

const CopySongButton = ({ songId, songTitle, initialContext, isOriginalSong = false }: CopySongButtonProps) => {
  const router = useRouter();
  const [context, setContext] = useState<SongCopyContext>(initialContext);
  const [contextLoading, setContextLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictPreview, setConflictPreview] = useState<SongCopyConflictPreview | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [titleOverride, setTitleOverride] = useState(songTitle);
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    setContext(initialContext);
  }, [initialContext]);

  useEffect(() => {
    setTitleOverride(songTitle);
  }, [songTitle]);

  const refreshContext = useCallback(async () => {
    try {
      setContextLoading(true);
      const updated = await getSongCopyContext(songId);
      setContext(updated);
    } catch (error) {
      console.error("Failed to refresh copy context", error);
    } finally {
      setContextLoading(false);
    }
  }, [songId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      refreshContext();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshContext();
      }
    };
    window.addEventListener("active-team-changed", handler as EventListener);
    window.addEventListener("focus", handler as EventListener);
    window.addEventListener("popstate", handler as EventListener);
    window.addEventListener("pageshow", handler as EventListener);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("active-team-changed", handler as EventListener);
      window.removeEventListener("focus", handler as EventListener);
      window.removeEventListener("popstate", handler as EventListener);
      window.removeEventListener("pageshow", handler as EventListener);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshContext]);

  const handleCopy = useCallback(
    async (overrideTitle?: string) => {
      try {
        setIsSubmitting(true);
        setTitleError(null);
        const result = await copySongToActiveTeamAction({ songId, titleOverride: overrideTitle });
        if (result.status === "success") {
          toast.success("Пісню скопійовано у вашу команду");
          setDialogOpen(false);
          setConflictPreview(null);
          setTitleOverride(songTitle);
          await refreshContext();
          router.refresh();
          return;
        }
        if (result.status === "conflict") {
          setConflictPreview(result.existing);
          setDialogOpen(true);
          if (overrideTitle) {
            setTitleError("Ця назва також зайнята. Спробуйте іншу.");
          }
          return;
        }
        if (result.status === "already_copied") {
          toast.info("Ця пісня вже скопійована у вашу команду");
          await refreshContext();
          return;
        }
        if (result.status === "same_team") {
          toast.info("Пісня вже належить вашій активній команді");
          await refreshContext();
          return;
        }
        if (result.status === "forbidden") {
          toast.error(result.reason);
          await refreshContext();
          return;
        }
        if (result.status === "error") {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Failed to copy song", error);
        toast.error("Не вдалося скопіювати пісню");
      } finally {
        setIsSubmitting(false);
      }
    },
    [refreshContext, router, songId, songTitle]
  );

  const handleDialogConfirm = async () => {
    const trimmed = titleOverride.trim();
    if (!trimmed) {
      setTitleError("Введіть нову назву пісні");
      return;
    }
    await handleCopy(trimmed);
  };

  const translateReason = useCallback((value?: string | null) => {
    switch (value) {
      case "Active team required":
        return "Щоб копіювати пісню, увійдіть у систему та оберіть активну команду.";
      case "Insufficient role":
        return "Недостатньо прав у цій команді для копіювання пісень.";
      default:
        return value || "Копіювання наразі недоступне.";
    }
  }, []);

  const reasonText = useMemo(() => {
    if (context.canCopy) return null;
    if (!context.hasActiveTeam) {
      return translateReason("Active team required");
    }
    return translateReason(context.reason);
  }, [context, translateReason]);

  return (
    <div className="mt-6 space-y-3">
      {context.canCopy ? (
        <button
          type="button"
          className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          onClick={() => handleCopy()}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Копіюємо..." : "Копіювати пісню в мою команду"}
        </button>
      ) : context.alreadyCopiedSongId &&
        (isOriginalSong || context.reason !== "Оригінал цієї пісні вже належить вашій активній команді") ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-medium">Пісня вже скопійована у вашу активну команду.</p>
          <Link href={`/songs/${context.alreadyCopiedSongId}`} className="mt-1 inline-flex font-semibold underline">
            Перейти до копії{context.alreadyCopiedSongTitle ? ` "${context.alreadyCopiedSongTitle}"` : ""}
          </Link>
        </div>
      ) : context.isSameTeam ? null : reasonText ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {reasonText}
        </div>
      ) : null}
      {contextLoading && (
        <p className="text-xs text-gray-500">Оновлення стану копіювання...</p>
      )}

      <CopySongConflictDialog
        open={dialogOpen}
        preview={conflictPreview}
        titleValue={titleOverride}
        isSubmitting={isSubmitting}
        error={titleError}
        onTitleChange={setTitleOverride}
        onConfirm={handleDialogConfirm}
        onClose={() => {
          setDialogOpen(false);
          setConflictPreview(null);
          setTitleError(null);
        }}
      />
    </div>
  );
};

export default CopySongButton;
