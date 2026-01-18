"use client";

import { GettedSong } from "@/types";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TagCard } from "@/components";

const TagPage = () => {
  const searchParams = useSearchParams();
  const forwardedTag = searchParams.get("forwardedTag");
  const [songs, setSongs] = useState<GettedSong[]>([]);

  useEffect(() => {
    const fetchSongs = async () => {
      const response = await fetch("/api/songs", {
        next: { revalidate: 60 },
      });
      const { songs } = await response.json();
      setSongs(songs);
    };

    fetchSongs();
  }, []);

  // Фільтруємо по масиву тегів
  const filteredSongs = forwardedTag
    ? songs.filter((song) => {
        const songTags = song.tags;
        // tags тепер завжди масив (string[])
        if (!songTags || songTags.length === 0) return false;
        return songTags.some(
          (t: string) => t.toLowerCase() === forwardedTag.toLowerCase()
        );
      })
    : null;

  return (
    <div className="padding-x max-w-[1600px] mx-auto">
      <section className="w-full max-w-full flex-start flex-col">
        <h1 className="head_text text-left">
          <span className="blue_gradient">За тегом</span>
        </h1>
        <p className="desc text-left max-w-md mb-16">
          Список пісень, які позначено таким ключовим словом:
        </p>

        {filteredSongs && <TagCard tag={forwardedTag} songs={filteredSongs} />}
      </section>
    </div>
  );
};

export default TagPage;
