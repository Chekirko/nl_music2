import CreateSongLink from "@/components/CreateSongLink";
import SongFilter from "@/components/SongFilter";
import SongsFeed from "@/components/SongsFeed";
import { SongFilters } from "@/constants/filters";

const SongsPage = () => {
  return (
    <>
      <div className="padding-x max-w-[1600px] mx-auto">
        <section className="w-full max-w-full flex-start flex-col">
          <h1 className="head_text text-left">
            <span className="blue_gradient">Загальний список</span>
          </h1>
          <p className="desc text-left max-w-md mb-12 lg:mb-16">
            Пісні, які співаються в церкві "Нове життя" м. Борислав:
          </p>
          <div className="self-end mb-8">
            <CreateSongLink />
          </div>

          <SongFilter filters={SongFilters} otherClasses="mb-10" />
          <SongsFeed />
        </section>
      </div>
    </>
  );
};

export default SongsPage;
