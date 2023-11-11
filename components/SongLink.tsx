import { SongLinkProps } from "@/types";
import Link from "next/link";

const SongLink = ({ route, type, id }: SongLinkProps) => {
  return (
    <Link href={`${route}?id=${id}`} className="font-bold">
      {type}
    </Link>
  );
};

export default SongLink;
