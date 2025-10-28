"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const AddSongByLinkLink = () => {
  const session = useSession();
  return (
    <>
      {session.data && session.data.user?.role === 'admin' ? (
        <Link
          href="/songs/add-by-link"
          className="bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-600 p-2 rounded h-fit max-w-max mb-4 font-semibold"
        >
          Додати пісню за посиланням
        </Link>
      ) : (
        <div className="p-2 rounded h-fit max-w-max mb-4 invisible">&nbsp;</div>
      )}
    </>
  );
};

export default AddSongByLinkLink;
