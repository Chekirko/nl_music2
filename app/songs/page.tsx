import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CreateSongLink from "@/components/CreateSongLink";
import AddSongByLinkLink from "@/components/AddSongByLinkLink";
import SongFilter from "@/components/SongFilter";
import TeamScopeFilter from "@/components/TeamScopeFilter";
import { getActiveTeamAction, getAllTeamsAction } from "@/lib/actions/teamActions";
import SongsFeed from "@/components/SongsFeed";
import { SongFilters } from "@/constants/filters";
import { getSongs, getSongsRanked } from "@/lib/actions/songActions";

export const metadata: Metadata = {
  title: "Пісні прославлення",
  description: "Повний список пісень прославлення з акордами та текстами. Знайдіть пісню для вашого служіння.",
  openGraph: {
    title: "Пісні прославлення | NL Songs",
    description: "Повний список пісень прославлення з акордами та текстами",
  },
};

interface PageProps {
  searchParams: { filter?: string; page?: string; scope?: string };
}

const PAGE_SIZE = 100;

const SongsPage = async ({ searchParams }: PageProps) => {
  const filter = searchParams.filter || "all";
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const scope = searchParams.scope || "all";
  
  // Fetch active team and all teams in parallel
  const [activeResult, teamsResult] = await Promise.all([
    getActiveTeamAction(),
    getAllTeamsAction(),
  ]);
  
  const activeTeamId = activeResult?.success && activeResult.team ? activeResult.team.id : null;
  const teams = teamsResult?.success && teamsResult.teams ? teamsResult.teams : [];
  
  // Check if scope requires active team but user doesn't have one
  const needsActiveTeam = scope === "team" || scope === "others";
  const hasActiveTeam = !!activeTeamId;
  const canShowSongs = !needsActiveTeam || hasActiveTeam;

  // For pop/rare filters, use ranked data (no pagination)
  const isRankedFilter = filter === "pop" || filter === "rare";
  
  let songs: Awaited<ReturnType<typeof getSongs>>["songs"] = [];
  let isNext = false;
  let totalCount = 0;
  let rankedData: Awaited<ReturnType<typeof getSongsRanked>> | undefined;

  if (canShowSongs) {
    if (isRankedFilter) {
      rankedData = await getSongsRanked(filter as "pop" | "rare", scope);
    } else {
      const result = await getSongs(filter, page, undefined, scope);
      songs = result.songs;
      isNext = result.isNext;
      totalCount = result.totalCount;

      // Auto-redirect to page 1 if current page exceeds available pages
      const totalPages = Math.ceil(totalCount / PAGE_SIZE);
      if (totalCount > 0 && page > totalPages) {
        const params = new URLSearchParams();
        if (filter !== "all") params.set("filter", filter);
        if (scope !== "all") params.set("scope", scope);
        params.set("page", "1");
        redirect(`/songs?${params.toString()}`);
      }
    }
  }
    
  return (
    <>
      <div className="padding-x max-w-[1600px] mx-auto">
        <section className="w-full max-w-full flex-start flex-col">
          <h1 className="head_text text-left">
            <span className="blue_gradient">Загальний список</span>
          </h1>
          <p className="desc text-left max-w-md mb-12 lg:mb-16">
            Пісні, які співаються для Божої слави:
          </p>
          <div className="self-end mb-8 flex gap-3">
            <CreateSongLink />
            <AddSongByLinkLink />
          </div>

          <div className="flex items-center justify-between gap-4 mb-10">
            <SongFilter filters={SongFilters} />
            <TeamScopeFilter teams={teams} />
          </div>
          {needsActiveTeam && !hasActiveTeam ? (
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded p-4">
              Щоб переглядати пісні команди, увійдіть у систему та оберіть активну команду.
            </div>
          ) : (
            <SongsFeed 
              songs={songs} 
              isNext={isNext} 
              totalCount={totalCount}
              filter={filter} 
              page={page} 
              activeTeamId={activeTeamId}
              rankedData={rankedData}
            />
          )}
        </section>
      </div>
    </>
  );
};

export default SongsPage;
