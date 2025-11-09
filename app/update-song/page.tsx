import { getSongById } from "@/lib/actions/songActions";
import UpdateSongClient from "@/components/UpdateSongClient";
import { canEditSong } from "@/lib/permissions";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: { id?: string };
}

const UpdateSong = async ({ searchParams }: PageProps) => {
  const id = searchParams.id || "";
  if (!id) {
    redirect("/songs");
  }

  const access = await canEditSong(id);
  if (!access.ok) {
    redirect("/songs");
  }

  const song = await getSongById(id);
  return <UpdateSongClient initialSong={song} />;
};

export default UpdateSong;
