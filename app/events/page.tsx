import { EventsPageComponent } from "@/components";
import CreateEventLink from "@/components/CreateEventLink";

export const dynamic = "force-dynamic";

const EventsPage = () => {
  return (
    <div className="padding-x mt-16 max-w-[1600px] mx-auto min-h-screen">
      <CreateEventLink />
      <EventsPageComponent />
    </div>
  );
};

export default EventsPage;
