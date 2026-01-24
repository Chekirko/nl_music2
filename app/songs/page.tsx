import type { Metadata } from "next";
import CreateSongLink from "@/components/CreateSongLink";
import AddSongByLinkLink from "@/components/AddSongByLinkLink";
import SongFilter from "@/components/SongFilter";
import TeamScopeFilter from "@/components/TeamScopeFilter";
import { getActiveTeamAction } from "@/lib/actions/teamActions";
import SongsFeed from "@/components/SongsFeed";
import { SongFilters } from "@/constants/filters";
import { getSongs } from "@/lib/actions/songActions";

export const metadata: Metadata = {
  title: "Пісні прославлення",
  description: "Повний список пісень прославлення з акордами та текстами. Знайдіть пісню для вашого служіння.",
  openGraph: {
    title: "Пісні прославлення | NL Songs",
    description: "Повний список пісень прославлення з акордами та текстами",
  },
};

interface PageProps {
  searchParams: { filter?: string; page?: string; scope?: "team" | "all" };
}

const SongsPage = async ({ searchParams }: PageProps) => {
  const filter = searchParams.filter || "all";
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const scope = (searchParams.scope as "team" | "all") || "all";
  const active = await getActiveTeamAction();
  const activeTeamId = active && active.success && active.team ? active.team.id : null;
  const hasTeam = scope === "team" ? !!activeTeamId : true;
  const { songs, isNext } = hasTeam
    ? await getSongs(filter, page, undefined, scope)
    : { songs: [], isNext: false };
  return (
    <>
      <div className="padding-x max-w-[1600px] mx-auto">
        <section className="w-full max-w-full flex-start flex-col">
          <h1 className="head_text text-left">
            <span className="blue_gradient">Загальний список</span>
          </h1>
          <p className="desc text-left max-w-md mb-12 lg:mb-16">
            Пісні, які співаються в церкві "Нове життя" м. Борислав:
          </p>
          <div className="self-end mb-8 flex gap-3">
            <CreateSongLink />
            <AddSongByLinkLink />
          </div>

          <div className="flex items-center justify-between gap-4 mb-10">
            <SongFilter filters={SongFilters} />
            <TeamScopeFilter />
          </div>
          {scope === "team" && !hasTeam ? (
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded p-4">
              Щоб переглядати пісні команди, увійдіть у систему та оберіть активну команду.
            </div>
          ) : (
            <SongsFeed songs={songs} isNext={isNext} filter={filter} page={page} activeTeamId={activeTeamId} />
          )}
        </section>
      </div>
    </>
  );
};

export default SongsPage;
