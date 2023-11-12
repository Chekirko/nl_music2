"use client";

import { GettedSong } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import CardList from "./CardList";
import { SearchBar, SongLink } from ".";

const SongsFeed = () => {
  const [songs, setSongs] = useState<GettedSong[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchSongs = async () => {
      const response = await fetch("/api/songs", {
        next: { revalidate: 60 },
      });
      const data = await response.json();
      setSongs(data);
      console.log(data);
    };

    fetchSongs();
  }, []);
  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row items-end lg:items-start lg:justify-between">
        <div className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 p-2 rounded h-fit max-w-max mb-4">
          <SongLink route="/create-song" type="Додати пісню"></SongLink>
        </div>
        <SearchBar songs={songs} />
      </div>
      <CardList songs={songs} />
    </div>
  );
};

export default SongsFeed;
