import { getSongById } from "@/lib/actions/songActions";
import SingleSongClient from "@/components/SingleSongClient";

interface PageProps {
  params: { slug: string };
}

const SingleSongPage = async ({ params }: PageProps) => {
  const song = await getSongById(params.slug);
  return <SingleSongClient id={params.slug} initialSong={song} />;
};

export default SingleSongPage;
