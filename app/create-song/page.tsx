import { redirect } from "next/navigation";
import { canCreateSong } from "@/lib/permissions";
import CreateSongClient from "@/components/Songs/CreateSongClient";

const CreateSongPage = async () => {
  const access = await canCreateSong();
  if (!access.ok) {
    redirect("/songs");
  }

  return <CreateSongClient />;
};

export default CreateSongPage;

