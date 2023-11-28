import { EventFormBlockProps } from "@/types";
import { SearchTitleForEvent } from ".";

const EventFormBlock = ({
  songs,
  event,
  setEvent,
  song,
  index,
}: EventFormBlockProps) => {
  return (
    <label>
      <span className="font-satoshi font-semibold text-base text-gray-700">
        Пісня {index}
      </span>
      {/* {song && song.title !== "" && <div>Зараз в списку: {song.title}</div>} */}
      <SearchTitleForEvent
        songs={songs}
        index={index}
        setEvent={setEvent}
        event={event}
        existedSong={song}
      />
    </label>
  );
};

export default EventFormBlock;
