import { AlphCardProps } from "@/types";
import Image from "next/image";
import Link from "next/link";

const AlphCard = ({ letter, songs }: AlphCardProps) => {
  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().startsWith(letter.toLowerCase())
  );

  return (
    <div className="alph_card">
      <div className="flex justify-between items-start gap-5">
        <div className="flex-1 flex justify-start items-center gap-3 cursor-pointer">
          <Image
            src="/logoi.svg"
            alt="user_image"
            width={40}
            height={40}
            className="rounded-full object-contain"
          />

          <div className="flex flex-col">
            <h3 className="font-satoshi uppercase font-extrabold text-3xl text-gray-900">
              {letter}
            </h3>
            <p className="font-inter text-sm text-gray-500">Пісні</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        {filteredSongs.map((song) => (
          <Link href={`/songs/${song._id}`} className="alph_link">
            {song.title}{" "}
          </Link>
        ))}
      </div>

      {/* <p className="my-4 font-satoshi text-sm text-gray-700"></p> */}
      {/* <h4 className="mb-4 font-satoshi font-semibold text-gray-700">
        {letter}
      </h4> */}
    </div>
  );
};

export default AlphCard;
