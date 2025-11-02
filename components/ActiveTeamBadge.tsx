"use client";
import { useEffect, useState } from "react";
import { getActiveTeamAction, getUserTeamsAction, setActiveTeamAction } from "@/lib/actions/teamActions";

export default function ActiveTeamBadge() {
  const [team, setTeam] = useState<{ id: string; name: string } | null>(null);
  const [allTeams, setAllTeams] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const load = async () => {
      const t = await getActiveTeamAction();
      if (t.success) setTeam(t.team);
      const tu = await getUserTeamsAction();
      if (tu.success) setAllTeams(tu.teams);
    };
    load();
  }, []);

  const changeTeam = async (id: string) => {
    const res = await setActiveTeamAction(id);
    if (res.success) {
      const t = await getActiveTeamAction();
      if (t.success) setTeam(t.team);
    }
  };

  if (!team?.name) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="px-3 py-1 rounded-full border border-blue-500 text-blue-100 text-sm">
        Команда: {team.name}
      </span>
      {allTeams.length > 1 && (
        <select
          className="text-sm border border-blue-500 rounded px-2 py-1 bg-white text-gray-700"
          value={team.id}
          onChange={(e) => changeTeam(e.target.value)}
        >
          {allTeams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}

