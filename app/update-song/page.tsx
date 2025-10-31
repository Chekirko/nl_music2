import { getSongById } from "@/lib/actions/songActions";
import UpdateSongClient from "@/components/UpdateSongClient";

interface PageProps { searchParams: { id?: string } }

const UpdateSong = async ({ searchParams }: PageProps) => {
  const id = searchParams.id || "";
  const song = await getSongById(id);
  return <UpdateSongClient initialSong={song} />;
};

export default UpdateSong;
