import {
  SearchTitleForNewSongInEventProps,
  EventSong,
  GettedSong,
} from "@/types";
import { Combobox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { CheckIcon } from "lucide-react";
import { Fragment, useState } from "react";

const SearchTitleForNewSongInEvent = ({
  songs,
  selectedSong,
  setSelectedSong,
}: SearchTitleForNewSongInEventProps) => {
  const [query, setQuery] = useState("");

  const handleSongSelect = (song: GettedSong) => {
    if (!song) return;
    setSelectedSong(song);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setQuery(value);

    if (value === "") {
      setSelectedSong(null);
    }
  };

  const filteredSongs =
    query === ""
      ? songs
      : songs.filter((song) => {
          return song.title.toLowerCase().includes(query.toLowerCase());
        });
  return (
    <div className="w-72 flex sm:flex-start flex-end gap-4">
      <Combobox value={selectedSong} onChange={setSelectedSong}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-500 font-bold focus:ring-0 focus:border-2 focus:border-gray-500"
              displayValue={(song: GettedSong) => song?.title}
              onChange={handleInputChange}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {filteredSongs.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredSongs.map((song) => (
                  <Combobox.Option
                    key={song._id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-blue-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={song}
                    onClick={() => handleSongSelect(song)}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {song.title}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-teal-600"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>

      {/* {selectedSong && (
        <button onClick={handleSongSelect} className="">
          <ArrowRightIcon className="h-8 w-8 text-gray-400" />
        </button>
      )} */}
    </div>
  );
};

export default SearchTitleForNewSongInEvent;
