import { CardListProps } from "@/types";
import { SearchTitle, SearchWord } from ".";

const SearchBar = ({ songs }: CardListProps) => {
  return (
    <div className="mt-4 flex sm:flex-row flex-col items-end">
      <div>
        <h2 className="mb-2 text-gray-600 mr-auto">Пошук за назвою</h2>
        <SearchTitle songs={songs} />
      </div>
      <div>
        <h2 className="mb-2 text-gray-600">Пошук за словами</h2>
        <SearchWord songs={songs} />
      </div>
    </div>
  );
};

export default SearchBar;
