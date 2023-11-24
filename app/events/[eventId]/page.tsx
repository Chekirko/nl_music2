"use client";

import { OurEvent } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SingleEventPageProps {
  params: {
    eventId: string;
  };
}

const SingleEventPage = ({ params }: SingleEventPageProps) => {
  const [event, setEvent] = useState<OurEvent>();
  useEffect(() => {
    const fetchEvent = async () => {
      const response = await fetch(`/api/events/single?id=${params.eventId}`, {
        next: { revalidate: 60 },
      });
      const event = await response.json();
      setEvent(event);
    };

    fetchEvent();
  }, []);
  return (
    <section className="padding-x py-5">
      <h1 className="head_text  text-primary-600">{event?.title}</h1>
      <div className="border-2 mt-10 w-1/5 border-gray-300 rounded"></div>
      <div className="mt-5 font-bold text-lg text-primary-800">
        <p>Дата: </p>
        {event?.date ? new Date(event.date).toLocaleDateString() : "No date"}
      </div>
      <div className="border-2 mt-5 w-1/5 border-gray-300 rounded"></div>
      <ul className="flex flex-col gap-6 mt-10 pl-8 text-lg font-medium">
        {event?.songs &&
          event.songs.map((song, index) => (
            <li key={index}>
              {/* <h2 className="mb-4">Пісня {index}</h2> */}
              <Link
                href={`/songs/${song.song}`}
                className="bg-gray-400 text-white hover:bg-gray-500 text-xl font-bold py-1.5 px-4 rounded-full"
              >
                {index}. {song.title}
              </Link>
            </li>
          ))}
      </ul>
    </section>
  );
};

export default SingleEventPage;
