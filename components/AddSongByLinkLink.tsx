"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { checkCanCreateSongAction } from "@/lib/actions/songActions";

const AddSongByLinkLink = () => {
  const [canCreate, setCanCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      const result = await checkCanCreateSongAction();
      setCanCreate(result);
      setLoading(false);
    };
    checkPermission();
  }, []);

  if (loading) {
    return <div className="p-2 rounded h-fit max-w-max mb-4 invisible">&nbsp;</div>;
  }

  return (
    <>
      {canCreate ? (
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
