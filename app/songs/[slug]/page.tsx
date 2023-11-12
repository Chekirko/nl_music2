"use client";
import { SongLink } from "@/components";
import { songData } from "@/constants/scheduleData";
import { GettedSong } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SingleSongPageProps {
  params: {
    slug: string;
  };
}

const SingleSongPage = ({ params }: SingleSongPageProps) => {
  const router = useRouter();
  const [song, setSong] = useState<GettedSong>();

  useEffect(() => {
    const fetchSong = async () => {
      const response = await fetch(`/api/songs/single?id=${params.slug}`, {
        next: { revalidate: 60 },
      });
      const song = await response.json();
      setSong(song);
    };

    fetchSong();
  }, []);

  const sortedBlocks = song?.blocks
    .filter((block) => block.name !== "")
    .sort((a, b) => Number(a.ind) - Number(b.ind));

  const tags = song?.tags !== "" ? song?.tags?.split(" ") : null;

  return (
    <div className="padding-x">
      <h1 className="head_text  text-blue-600">{song?.title}</h1>
      <div className="border-2 mt-5 w-1/5 border-gray-300 rounded"></div>
      <p className="mt-5">Тональність: {song?.key}</p>
      {song?.comment && song.comment !== "" && <p>Коментар: {song.comment}</p>}
      {song?.mode && song.mode !== "" && <p>Модуляція: {song.mode}</p>}
      {song?.origin && song.origin !== "" && (
        <p>
          Оригінал пісні:{" "}
          <Link href={song.origin} className="font-semibold blue_gradient">
            перейти...
          </Link>
        </p>
      )}
      <div className="border-2 my-5 w-1/5 border-gray-300 rounded"></div>
      <div className="flex flex-wrap gap-2">
        {tags &&
          tags.map((tag) => (
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
      {tags && (
        <div className="border-2 my-5 w-1/5 border-gray-300 rounded"></div>
      )}
      <div>
        {sortedBlocks?.map((block, index) => {
          const lines = block.lines.split("\n");
          const renderLines = lines.map((line, i) => {
            let style;

            if (Number(block.version) === 1) {
              if (i % 2 === 0) {
                style = "blue_gradient font-semibold ps-2"; // Парні рядки версії 1
              } else {
                style = "ps-2"; // Непарні рядки версії 1
              }
            } else if (Number(block.version) === 2) {
              style = "ps-2"; // Версія 2
            } else if (Number(block.version) === 3) {
              style = "blue_gradient font-semibold ps-2"; // Версія 3
            }
            return (
              <p key={i} className={style}>
                {line}
              </p>
            );
          });

          return (
            <div key={index} className="mb-6">
              <h3 className="font-semibold text-blue-900 mb-1 underline">
                {block.name}
              </h3>
              {renderLines}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 p-2 rounded w-max mb-6">
        <SongLink
          route="/update-song"
          type="Змінити пісню"
          id={params.slug}
        ></SongLink>
      </div>
      <div className="border-2 mb-6 w-1/5 border-gray-300 rounded"></div>
      <div>
        <iframe
          width="500"
          height="281"
          src={song?.video}
          title="Тіло ломиме"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
        <style jsx>{`
          @media (max-width: 600px) {
            iframe {
              width: 100%; /* Ширина на мобільних пристроях */
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default SingleSongPage;
