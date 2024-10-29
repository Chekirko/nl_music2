"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

const CreateEventLink = () => {
  const session = useSession();
  return (
    <>
      {session.data ? (
        <div className="flex justify-end">
          <Link
            href="/events/create-new"
            className="py-3 px-8 bg-primary font-bold text-lg hover:bg-primary-dark text-white rounded-full"
          >
            Новий список
          </Link>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default CreateEventLink;
