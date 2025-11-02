import { CardListProps } from "@/types";
import { SearchTitle, SearchWord } from ".";

const SearchBar = ({ songs, activeTeamId }: CardListProps) => {
  return (
    <div className="mt-4 flex sm:flex-row flex-col gap-4 sm:gap-0 items-end sm:justify-end">
      <div>
        <h2 className="mb-4 px-4 py-1.5 text-gray-600 ml-auto border border-gray-400 rounded-xl w-max">
          Пошук за назвою
        </h2>
        <SearchTitle songs={songs} activeTeamId={activeTeamId} />
      </div>
      <div>
        <h2 className="mb-4 px-4 py-1.5 ml-auto text-gray-600 border border-gray-400 rounded-xl w-max">
          Пошук за словами
        </h2>
        <SearchWord songs={songs} activeTeamId={activeTeamId} />
      </div>
    </div>
  );
};

export default SearchBar;

// className = "flex flex-col justify-end";
