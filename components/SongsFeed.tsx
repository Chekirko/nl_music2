"use client";

import { GettedSong } from "@/types";
import CardList from "./CardList";
import { SearchBar, TagCard } from ".";
import Pagination from "./Pagination";

interface Props {
  songs: GettedSong[];
  isNext: boolean;
  filter?: string | null;
  page?: number;
}

const SongsFeed = ({ songs, isNext, filter, page = 1 }: Props) => {
  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row items-end lg:items-start lg:justify-between">
        {filter !== "pop" && filter !== "rare" ? (
          <h2 className="text-blue-600 font-semibold text-xl mb-10">
            У списку пісень: {songs.length}
          </h2>
        ) : (
          <div className="p-2 rounded h-fit max-w-max mb-4 invisible">&nbsp;</div>
        )}
        <div>
          <SearchBar songs={songs} />
        </div>
      </div>
      {filter === "pop" && <TagCard tag={"Популярні пісні"} songs={songs} />}
      {filter === "rare" && <TagCard tag={"Рідко виконувані пісні"} songs={songs} />}
      {filter !== "pop" && filter !== "rare" && <CardList songs={songs} />}
      <Pagination pageNumber={page} isNext={isNext} />
    </div>
  );
};

export default SongsFeed;
