import { AddSongToEventBlockProps } from "@/types";
import SearchTitleForNewSongInEvent from "./SearchTitleForNewSongInEvent";

const AddSongToEventBlock = ({
  songs,
  event,
  setEvent,
  selectedSong,
  setSelectedSong,
}: AddSongToEventBlockProps) => {
  return (
    <label className="flex flex-col gap-4">
      <span className="font-satoshi font-semibold text-base text-gray-700">
        Давай ще додамо пісню:
      </span>
      <SearchTitleForNewSongInEvent
        songs={songs}
        setEvent={setEvent}
        event={event}
        setSelectedSong={setSelectedSong}
        selectedSong={selectedSong}
      />
    </label>
  );
};

export default AddSongToEventBlock;
