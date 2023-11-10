import { CardListProps } from "@/types";
import { SearchTitle, SearchWord } from ".";

const SearchBar = ({ songs }: CardListProps) => {
  return (
    <div className="mt-4 flex">
      <div>
        <h2 className="mb-2 text-gray-600">Пошук за назвою</h2>
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
