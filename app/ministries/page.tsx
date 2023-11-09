import { MinistriesList } from "@/components";

const MinistriesPage = () => {
  return (
    <>
      <div className="padding-x">
        <h1 className="mb-10">Наша церква звершує наступні служіння:</h1>
        <MinistriesList />
      </div>
    </>
  );
};

export default MinistriesPage;
