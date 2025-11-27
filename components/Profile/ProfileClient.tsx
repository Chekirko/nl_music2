"use client";
import { useState, useTransition, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setActiveTeamAction } from "@/lib/actions/teamActions";

type TeamItem = { id: string; name: string };

interface Props {
  activeTeamId: string | null;
  teams: TeamItem[];
}

export default function ProfileClient({ activeTeamId, teams }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [optimisticActiveId, setOptimisticActiveId] = useState<string | null>(null);

  // Враховуємо оптимістичний стан
  const displayActiveId = optimisticActiveId ?? activeTeamId;

  const makeActive = useCallback(async (teamId: string) => {
    setErrorMessage(null);
    if (submittingId === teamId) return;
    setSubmittingId(teamId);
    setOptimisticActiveId(teamId);

    startTransition(async () => {
      try {
        const res = await setActiveTeamAction(teamId);
        if (res.success) {
          // Сигнал іншим компонентам
          if (typeof window !== "undefined") {
            try {
              window.dispatchEvent(new CustomEvent("active-team-changed", { detail: { teamId } }));
            } catch (err) {
              console.warn("Failed to dispatch active-team-changed event:", err);
            }
            try {
              if (window.localStorage) {
                localStorage.removeItem("pinnedEvent");
                window.dispatchEvent(new CustomEvent("pinned-event-changed"));
              }
            } catch (err) {
              console.warn("Failed to clear pinnedEvent from localStorage:", err);
            }
          }
          try { router.refresh(); } catch (err) {
            console.warn("Failed to refresh router:", err);
          }
        } else {
          setErrorMessage(res.error || "Не вдалося змінити активну команду");
          setOptimisticActiveId(null);
        }
      } catch (err) {
        console.error("Failed to set active team:", err);
        setErrorMessage(err instanceof Error ? err.message : "Виникла помилка при зміні команди");
        setOptimisticActiveId(null);
      } finally {
        setSubmittingId(null);
      }
    });
  }, [submittingId, router]);

  // Слухаємо перемикання активної команди з бейджа в Navbar
  useEffect(() => {
    const onChanged = (e: any) => {
      const id = e?.detail?.teamId || null;
      if (id) setOptimisticActiveId(id);
      try { router.refresh(); } catch {}
    };
    if (typeof window !== "undefined") {
      window.addEventListener("active-team-changed", onChanged as EventListener);
      return () => window.removeEventListener("active-team-changed", onChanged as EventListener);
    }
  }, [router]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700">Мій профіль</h1>
        <Link 
          href="/teams/create" 
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Створити нову команду"
        >
          + Створити команду
        </Link>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            aria-label="Закрити повідомлення про помилку"
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      <section className="bg-white/5 p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Мої команди</h2>
        {teams.length === 0 ? (
          <div className="text-gray-600">
            Команд поки немає.{" "}
            <Link href="/teams/create" className="text-blue-600 hover:underline">
              Створіть першу команду
            </Link>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {teams.map((t) => {
              const isActive = displayActiveId === t.id;
              const isSubmitting = submittingId === t.id;
              return (
                <li key={t.id} className="flex items-center justify-between p-3 rounded hover:bg-gray-50 transition-colors">
                  <Link href={`/teams/${t.id}`} className="flex items-center gap-3">
                    <span className="font-medium text-blue-700 hover:underline">
                      {t.name}
                    </span>
                    {isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 border border-blue-300" role="status" aria-label="Активна команда">
                        Активна
                      </span>
                    )}
                  </Link>
                  {!isActive && (
                    <button
                      onClick={() => makeActive(t.id)}
                      disabled={isPending || isSubmitting}
                      className="px-3 py-1.5 rounded border border-blue-500 text-blue-700 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      aria-label={`Зробити команду ${t.name} активною`}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Застосування...
                        </span>
                      ) : (
                        "Зробити активною"
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
