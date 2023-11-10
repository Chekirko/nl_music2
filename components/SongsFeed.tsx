"use client";

import { GettedSong } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import CardList from "./CardList";
import { SearchBar } from ".";

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
      <SearchBar songs={songs} />
      <CardList songs={songs} />
    </div>
  );
};

export default SongsFeed;
