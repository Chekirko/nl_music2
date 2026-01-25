"use client";

import { GettedSong } from "@/types";
import CardList from "./CardList";
import { SearchBar, TagCard } from ".";
import Pagination from "./Pagination";

interface Props {
  songs: GettedSong[];
  isNext: boolean;
  totalCount: number;
  filter?: string | null;
  page?: number;
  activeTeamId?: string | null;
  // For ranked views (pop/rare)
  rankedData?: {
    primary: GettedSong[];
    secondary: GettedSong[];
    primaryLabel: string;
    secondaryLabel: string;
  };
}

const SongsFeed = ({
  songs,
  isNext,
  totalCount,
  filter,
  page = 1,
  activeTeamId,
  rankedData,
}: Props) => {
  // If we have ranked data (pop/rare), show sectioned view without pagination
  if (rankedData && (filter === "pop" || filter === "rare")) {
    const totalRanked = rankedData.primary.length + rankedData.secondary.length;
    return (
      <div className="w-full">
        <div className="flex flex-col lg:flex-row items-end lg:items-start lg:justify-between">
          <h2 className="text-blue-600 font-semibold text-xl mb-10">
            {filter === "pop" ? "Популярні пісні" : "Рідкісні пісні"}: {totalRanked}
          </h2>
          <div>
            <SearchBar songs={[...rankedData.primary, ...rankedData.secondary]} activeTeamId={activeTeamId} />
          </div>
        </div>

        {/* Primary section - Top 30 */}
        {rankedData.primary.length > 0 && (
          <TagCard
            tag={rankedData.primaryLabel}
            songs={rankedData.primary}
            activeTeamId={activeTeamId}
          />
        )}

        {/* Secondary section - Next 50 */}
        {rankedData.secondary.length > 0 && (
          <div className="mt-8">
            <TagCard
              tag={rankedData.secondaryLabel}
              songs={rankedData.secondary}
              activeTeamId={activeTeamId}
            />
          </div>
        )}
      </div>
    );
  }

  // Regular view with pagination
  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row items-end lg:items-start lg:justify-between">
        <h2 className="text-blue-600 font-semibold text-xl mb-10">
          У списку пісень: {totalCount}
        </h2>
        <div>
          <SearchBar songs={songs} activeTeamId={activeTeamId} />
        </div>
      </div>
      <CardList songs={songs} activeTeamId={activeTeamId} />
      <Pagination 
        pageNumber={page} 
        isNext={isNext} 
        totalCount={totalCount}
        pageSize={100}
      />
    </div>
  );
};

export default SongsFeed;
