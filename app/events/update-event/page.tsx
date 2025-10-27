import { getSongs } from "@/lib/actions/songActions";
import { UpdateEventForm } from "@/components/Events/UpdateEventForm";

interface PageProps {
  searchParams: { id?: string };
}

const UpdateEventPage = async ({ searchParams }: PageProps) => {
  const id = searchParams.id || "";
  const { songs } = await getSongs("all");

  return (
    <section className="padding-x w-full max-w-[1600px] mx-auto flex-start flex-col">
      <h1 className="head_text text-left">
        <span className="blue_gradient">Оновлення події</span>
      </h1>
      <p className="desc text-left max-w-md">Змінити назву, дату і пісні</p>

      <UpdateEventForm initialSongs={songs} />
    </section>
  );
};

export default UpdateEventPage;
export const dynamic = "force-dynamic";
