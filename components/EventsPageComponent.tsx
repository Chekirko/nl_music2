"use client";

import { OurEvent } from "@/types";
import { YearAccordion } from "@/components";

interface Props {
  events: OurEvent[];
}

const EventsPageComponent = ({ events }: Props) => {
  return (
    <div className="mt-16 flex justify-around">
      <YearAccordion events={events} />
    </div>
  );
};

export default EventsPageComponent;
