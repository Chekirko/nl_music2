"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getActiveTeamAction, getUserTeamsAction, setActiveTeamAction } from "@/lib/actions/teamActions";

export default function ActiveTeamBadge() {
  const [team, setTeam] = useState<{ id: string; name: string } | null>(null);
  const [allTeams, setAllTeams] = useState<Array<{ id: string; name: string }>>([]);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const load = async () => {
    const t = await getActiveTeamAction();
    if (t.success) setTeam(t.team as any);
    const tu = await getUserTeamsAction();
    if (tu.success) setAllTeams(tu.teams as any);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    load();
  }, [pathname]);

  useEffect(() => {
    const onChanged = () => load();
    window.addEventListener("active-team-changed", onChanged as any);
    window.addEventListener("focus", onChanged);
    return () => {
      window.removeEventListener("active-team-changed", onChanged as any);
      window.removeEventListener("focus", onChanged);
    };
  }, []);

  const changeTeam = async (id: string) => {
    const res = await setActiveTeamAction(id);
    if (res.success) {
      await load();
      setOpen(false);
      try {
        window.dispatchEvent(new CustomEvent("active-team-changed"));
      } catch {}
      try {
        localStorage.removeItem("pinnedEvent");
        window.dispatchEvent(new CustomEvent("pinned-event-changed"));
      } catch {}
      try { router.refresh(); } catch {}
    }
  };

  if (!team?.name) return null;
  return (
    <div className="relative">
      <button
        type="button"
        className="px-3 py-1 rounded-full border border-blue-500 text-blue-100 text-sm hover:bg-blue-600/10"
        onClick={() => setOpen((v) => !v)}
        title="Активна команда"
      >
        Команда: {team.name}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black/5 z-50">
          <ul className="py-1 text-sm text-gray-700 max-h-64 overflow-auto">
            {allTeams.map((t) => {
              const isActive = team && team.id === t.id;
              return (
                <li key={t.id}>
                  <button
                    className={`w-full text-left px-3 py-2 hover:bg-blue-50 ${isActive ? "font-semibold text-blue-700" : ""}`}
                    onClick={() => changeTeam(t.id)}
                  >
                    {t.name} {isActive ? "•" : ""}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
