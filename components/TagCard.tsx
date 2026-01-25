import { TagCardProps } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";

const TagCard = ({ tag, songs, activeTeamId }: TagCardProps) => {
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
              {tag}
            </h3>
            <p className="font-inter text-sm text-gray-500">Пісні</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        {songs.map((song) => (
          <Link
            href={`/songs/${song._id}`}
            className="alph_link w-full"
            key={song._id}
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="truncate">{song.title}</span>
              {activeTeamId &&
                (song as any).team &&
                String((song as any).team) === String(activeTeamId) && (
                  <ShieldCheckIcon
                    title="Пісня моєї команди"
                    className="w-4 h-4 text-yellow-500"
                  />
                )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TagCard;
