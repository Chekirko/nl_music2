"use client";

import { useEffect, useState } from "react";
import { OurEvent } from "@/types";
import { YearAccordion } from "@/components";

const EventsPageComponent = () => {
  const [events, setEvents] = useState<OurEvent[]>([]);

  const fetchEvents = async () => {
    const response = await fetch("/api/events", { next: { revalidate: 60 } });
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
