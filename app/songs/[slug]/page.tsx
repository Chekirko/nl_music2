import type { Metadata } from "next";
import { getSongById, getSongCopyContext } from "@/lib/actions/songActions";
import SingleSongClient from "@/components/SingleSongClient";
import { canDeleteSong, canEditSong } from "@/lib/permissions";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const song = await getSongById(params.slug);
    const firstBlock = song.blocks?.[0]?.lines?.substring(0, 100) || "";
    return {
      title: song.title,
      description: `${song.title} — акорди та текст пісні${song.key ? ` в тональності ${song.key}` : ""}. ${firstBlock}...`,
      openGraph: {
        title: `${song.title} — акорди та текст`,
        description: `Пісня прославлення "${song.title}"${song.teamName ? ` від команди ${song.teamName}` : ""}`,
      },
    };
  } catch {
    return {
      title: "Пісня",
      description: "Пісня прославлення з акордами та текстом",
    };
  }
}

const SingleSongPage = async ({ params }: PageProps) => {
  const song = await getSongById(params.slug);
  const copyContext = await getSongCopyContext(params.slug);
  const editAccess = await canEditSong(params.slug);
  const deleteAccess = await canDeleteSong(params.slug);
  return (
    <SingleSongClient
      id={params.slug}
      initialSong={song}
      canEdit={!!editAccess.ok}
      canDelete={!!deleteAccess.ok}
      initialCopyContext={copyContext}
    />
  );
};

export default SingleSongPage;
