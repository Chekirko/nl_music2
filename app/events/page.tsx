import { EventsPageComponent } from "@/components";
import CreateEventLink from "@/components/CreateEventLink";
import { getAllEvents } from "@/lib/actions/eventActions";

export const dynamic = "force-dynamic";

const EventsPage = async () => {
  const events = await getAllEvents();
  return (
    <div className="padding-x mt-16 max-w-[1600px] mx-auto min-h-screen">
      <CreateEventLink />
      <EventsPageComponent events={events} />
    </div>
  );
};

export default EventsPage;
