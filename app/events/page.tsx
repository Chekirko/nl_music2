import { EventsPageComponent } from "@/components";
import CreateEventLink from "@/components/CreateEventLink";
import { getAllEvents } from "@/lib/actions/eventActions";
import { getActiveTeamAction } from "@/lib/actions/teamActions";

export const dynamic = "force-dynamic";

const EventsPage = async () => {
  const active = await getActiveTeamAction();
  const hasTeam = active.success && active.team;
  const events = hasTeam ? await getAllEvents() : [];
  return (
    <div className="padding-x mt-16 max-w-[1600px] mx-auto min-h-screen">
      {hasTeam ? (
        <>
          <CreateEventLink />
          <EventsPageComponent events={events} />
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded p-4">
          Щоб переглянути Події, увійдіть у систему та оберіть активну команду.
        </div>
      )}
    </div>
  );
};

export default EventsPage;
