"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { OurEvent } from "@/types";
import { YearAccordion } from "@/components";

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

  return (
    <div className="padding-x mt-16">
      <div className="flex justify-end">
        <Link
          href="/events/create-new"
          className="py-3 px-8 bg-primary font-bold text-lg hover:bg-primary-dark text-white rounded-full"
        >
          Новий список
        </Link>
      </div>

      <div className="mt-16 flex justify-around">
        <YearAccordion events={events} />
      </div>
    </div>
  );
};

export default EventsPage;
