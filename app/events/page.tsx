"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { OurEvent } from "@/types";

const EventsPage = () => {
  const [events, setEvents] = useState<OurEvent[]>([]);

  useEffect(() => {
    const fetchSongs = async () => {
      const response = await fetch("/api/events", {
        next: { revalidate: 60 },
      });
      const data = await response.json();
      setEvents(data);
    };
    fetchSongs();
  }, []);

  const oneEvent = events[0];
  return (
    <div className="padding-x mt-16">
      <Link
        href="/events/create-new"
        className=" py-3 px-8 w-full bg-primary font-bold text-lg hover:bg-primary-dark text-white rounded-full"
      >
        Новий список
      </Link>

      {oneEvent?.songs.map((song) => (
        <Link key={song.title} href={`/songs/${song.song}`}>
          {song.title}
        </Link>
      ))}
    </div>
  );
};

export default EventsPage;
