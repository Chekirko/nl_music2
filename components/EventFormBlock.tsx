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
      {/* <input
        value={song._id}
        placeholder="Назва частини пісні"
        className="form_input"
        readOnly
      /> */}
      <SearchTitleForEvent
        songs={songs}
        index={index}
        setEvent={setEvent}
        event={event}
      />
    </label>
  );
};

export default EventFormBlock;
