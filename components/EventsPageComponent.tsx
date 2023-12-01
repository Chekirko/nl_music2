"use client";

import { useEffect, useState } from "react";
import { OurEvent } from "@/types";
import { YearAccordion } from "@/components";

export const dynamic = "force-dynamic";

const EventsPageComponent = () => {
  const [events, setEvents] = useState<OurEvent[]>([]);

  const fetchEvents = async () => {
    const response = await fetch("/api/events");
    const data = await response.json();
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);
  return (
    <div className="mt-16 flex justify-around">
      <YearAccordion events={events} />
    </div>
  );
};

export default EventsPageComponent;
