import Link from "next/link";
import { Plus } from "lucide-react";

const EventsPage = () => {
  return (
    <div className="padding-x mt-16">
      <Link
        href="/events/create-new"
        className=" py-3 px-8 w-full bg-primary font-bold text-lg hover:bg-primary-dark text-white rounded-full"
      >
        Новий список
      </Link>
    </div>
  );
};

export default EventsPage;
