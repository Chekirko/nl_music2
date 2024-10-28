"use client";

import { useSession } from "next-auth/react";
import SongLink from "./SongLink";

const CreateSongLink = () => {
  const session = useSession();
  return (
    <>
      {session.data ? (
        <div className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 p-2 rounded h-fit max-w-max mb-4">
          <SongLink route="/create-song" type="Додати пісню"></SongLink>
        </div>
      ) : (
        <div className="p-2 rounded h-fit max-w-max mb-4 invisible">
          Ljlfq gdgdg
        </div>
      )}
    </>
  );
};

export default CreateSongLink;
