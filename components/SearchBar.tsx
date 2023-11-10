import { CardListProps } from "@/types";
import { SearchTitle } from ".";

const SearchBar = ({ songs }: CardListProps) => {
  return (
    <div>
      <SearchTitle songs={songs} />
    </div>
  );
};

export default SearchBar;
