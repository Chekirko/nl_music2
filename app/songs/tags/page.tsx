"use client";

import { GettedSong } from "@/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AllTagsPage = () => {
  const router = useRouter();
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

  const allTagsArray = songs.reduce<string[]>((acc, song) => {
    if (song && song.tags) {
      const tags = song.tags.split(" ").filter((tag) => tag.trim() !== "");
      return acc.concat(tags);
    }
    return acc;
  }, []);

  // Використовуємо Set для отримання унікальних тегів
  const uniqueTags = [...new Set(allTagsArray)];

  return (
    <div className="max-w-[1600px] mx-auto flex flex-start gap-4 padding-x min-h-screen">
      <section className="w-full max-w-full flex-start flex-col">
        <h1 className="head_text text-left">
          <span className="blue_gradient">Доступні теги</span>
        </h1>
        <p className="desc text-left max-w-md mb-16">
          Шукай пісню за потрібним ключовим словом:
        </p>

        <div className="flex gap-4 flex-wrap">
          {" "}
          {uniqueTags &&
            uniqueTags.map((tag) => (
              <button
                className="px-5 py-1.5 text-sm bg-blue-600 hover:bg-blue-800 rounded-full text-white"
                key={tag}
                type="button"
                onClick={() => {
                  router.push(`/songs/tags/${tag}?forwardedTag=${tag}`);
                }}
              >
                {tag}
              </button>
            ))}
        </div>
      </section>
    </div>
  );
};

export default AllTagsPage;
