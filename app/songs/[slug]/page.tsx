import { getSongById, getSongCopyContext } from "@/lib/actions/songActions";
import SingleSongClient from "@/components/SingleSongClient";
import { canDeleteSong, canEditSong } from "@/lib/permissions";

interface PageProps {
  params: { slug: string };
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
