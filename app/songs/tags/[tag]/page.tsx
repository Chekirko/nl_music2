"use client";

import { GettedSong } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const TagPage = () => {
  const searchParams = useSearchParams();
  const forwardedTag = searchParams.get("forwardedTag");
  const [songs, setSongs] = useState<GettedSong[]>([]);
  useEffect(() => {
    const fetchSongs = async () => {
      const response = await fetch("/api/songs", {
        next: { revalidate: 60 },
      });
      const data = await response.json();
      setSongs(data);
    };

    fetchSongs();
  }, []);

  const filteredSongs = forwardedTag
    ? songs.filter((song) =>
        song.tags?.toLowerCase().includes(forwardedTag.toLowerCase())
      )
    : null;

  return (
    <div>
      {filteredSongs &&
        filteredSongs.map((song) => (
          <Link
            href={`/songs/${song._id}`}
            className="alph_link"
            key={song._id}
          >
            {song.title}{" "}
          </Link>
        ))}
    </div>
  );
};

export default TagPage;
