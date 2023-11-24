import SongsFeed from "@/components/SongsFeed";

const SongsPage = () => {
  return (
    <>
      <div className="padding-x">
        <section className="w-full max-w-full flex-start flex-col">
          <h1 className="head_text text-left">
            <span className="blue_gradient">Загальний список</span>
          </h1>
          <p className="desc text-left max-w-md mb-12 lg:mb-16">
            Пісні, які співаються в церкві "Нове життя" м. Борислав:
          </p>

          <SongsFeed />
        </section>
      </div>
    </>
  );
};

export default SongsPage;
