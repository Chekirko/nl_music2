import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { YearAccordionProps, OurEvent } from "@/types";
import Link from "next/link";

export function YearAccordion({ events }: YearAccordionProps) {
  const eventsByYear: Record<number, Record<number, OurEvent[]>> = {};

  events.forEach((ev) => {
    if (ev.date) {
      const eventYear = new Date(ev.date).getFullYear();
      const eventMonth = new Date(ev.date).getMonth() + 1;

      if (!eventsByYear[eventYear]) {
        eventsByYear[eventYear] = {};
      }
      if (!eventsByYear[eventYear][eventMonth]) {
        eventsByYear[eventYear][eventMonth] = [];
      }

      eventsByYear[eventYear][eventMonth].push(ev);
    }
  });

  return (
    <Accordion type="single" collapsible className="w-full lg:w-3/4">
      {Object.keys(eventsByYear)
        .reverse()
        .map((year) => (
          <AccordionItem
            key={year}
            value={`item-${year}`}
            className="bg-primary-600 rounded-2xl px-8 mb-4"
          >
            <AccordionTrigger className="text-lg font-bold text-white">
              {year}
            </AccordionTrigger>
            <AccordionContent>
              <Accordion type="single" collapsible className="w-full">
                {Object.keys(eventsByYear[Number(year)])
                  .reverse()
                  .map((month) => (
                    <AccordionItem
                      key={`${year}-${month}`}
                      value={`item-${year}-${month}`}
                      className="px-6 rounded-3xl bg-primary-800 mb-2"
                    >
                      <AccordionTrigger className="text-lg font-bold text-white">
                        {getMonthName(parseInt(month, 10) - 1)}
                      </AccordionTrigger>
                      <AccordionContent className="mt-4 sm:mt-8">
                        {eventsByYear[Number(year)][Number(month)].map(
                          (event) => (
                            <div
                              key={event._id}
                              className="mb-4 flex items-center gap-4"
                            >
                              <Link
                                href={`/events/${event._id}`}
                                className="bg-gray-400 text-white hover:bg-gray-500 sm:text-xl text-sm font-bold py-1.5 sm:px-4 px-2 rounded-full"
                              >
                                {event.date
                                  ? new Date(event.date).toLocaleDateString()
                                  : ""}{" "}
                                | {event.title}
                              </Link>
                            </div>
                          )
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
    </Accordion>
  );
}

function getMonthName(monthIndex: number) {
  const months = [
    "Січень",
    "Лютий",
    "Березень",
    "Квітень",
    "Травень",
    "Червень",
    "Липень",
    "Серпень",
    "Вересень",
    "Жовтень",
    "Листопад",
    "Грудень",
  ];
  return months[monthIndex];
}
