"use client";

import { GettedSong } from "@/types";
import { useEffect, useState } from "react";
import CardList from "./CardList";
import { SearchBar, SongLink, TagCard } from ".";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Pagination from "./Pagination";
import { fi } from "date-fns/locale";

const SongsFeed = () => {
  const [songs, setSongs] = useState<GettedSong[]>([]);
  const [searchText, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const [isNext, setIsNext] = useState(false);

  const filter = searchParams.get("filter");
  const page = searchParams.get("page");

  useEffect(() => {
    const fetchSongs = async () => {
      const response = await fetch(
        `/api/songs?filter=${filter ? filter : ""}&page=${page ? +page : 1}`,
        {
          next: { revalidate: 60 },
        }
      );
      const { songs, isNext } = await response.json();
      setIsNext(isNext);
      setSongs(songs);
    };

    fetchSongs();
  }, [filter, page]);
  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row items-end lg:items-start lg:justify-between">
        {filter !== "pop" && filter !== "rare" ? (
          <h2 className="text-blue-600 font-semibold text-xl mb-10">
            Всього пісень є: {songs.length}{" "}
          </h2>
        ) : (
          <div className="p-2 rounded h-fit max-w-max mb-4 invisible">
            Ljlfq gdgdg
          </div>
        )}
        <div>
          <SearchBar songs={songs} />
        </div>
      </div>
      {filter === "pop" && <TagCard tag={"Популярні пісні"} songs={songs} />}
      {filter === "rare" && <TagCard tag={"Рідкісні пісні"} songs={songs} />}
      {filter !== "pop" && filter !== "rare" && <CardList songs={songs} />}
      <Pagination pageNumber={page ? +page : 1} isNext={isNext} />
    </div>
  );
};

export default SongsFeed;
