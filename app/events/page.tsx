import Link from "next/link";
import { EventsPageComponent } from "@/components";

export const dynamic = "force-dynamic";

const EventsPage = () => {
  return (
    <div className="padding-x mt-16 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex justify-end">
        <Link
          href="/events/create-new"
          className="py-3 px-8 bg-primary font-bold text-lg hover:bg-primary-dark text-white rounded-full"
        >
          Новий список
        </Link>
      </div>
      <EventsPageComponent />
    </div>
  );
};

export default EventsPage;
