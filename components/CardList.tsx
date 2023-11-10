import { alphabet } from "@/constants";
import AlphCard from "./AlphCard";
import { CardListProps } from "@/types";

const CardList = ({ songs }: CardListProps) => {
  return (
    <section className="feed">
      <div className="prompt_layout">
        {alphabet.map((letter) => (
          <AlphCard letter={letter} songs={songs} key={letter} />
        ))}
      </div>
    </section>
  );
};

export default CardList;
