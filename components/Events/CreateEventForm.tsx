"use client";

import { GettedSong } from "@/types";
import { FormEvent, useEffect, useState } from "react";
import { useEventStore } from "@/store/eventStore";
import { AgreeModal } from "@/components";
import { DatePickerDemo } from "@/components/ui/datePickerDemo";
import { SongCombobox } from "@/components/Events/SongCombobox";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createEvent } from "@/lib/actions/eventActions";

interface Props {
  initialSongs: GettedSong[];
}

export const CreateEventForm = ({ initialSongs }: Props) => {
  const router = useRouter();
  const { event, setEvent, setSongs, addSongSlot, removeSongSlot } =
    useEventStore();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSongs(initialSongs);
  }, [initialSongs, setSongs]);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setEvent({ ...event, date: selectedDate || undefined });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const utcDate = event.date ? new Date(event.date).toISOString() : undefined;

    const result = await createEvent({
      title: event.title,
      live: event.live,
      playList: event.playList || "",
      date: utcDate,
      songs: event.songs,
    });

    setSubmitting(false);

    if (result.success) {
      router.push("/events");
    }
  };

  return (
    <form
      className="mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism"
      onSubmit={handleSubmit}
    >
      <label>
        <span className="font-satoshi font-semibold text-base text-gray-700">
          Тип служіння
        </span>{" "}
        <span className="bg-red-900 w-4 h-4"></span>
        <input
          value={event.title}
          onChange={(e) => setEvent({ ...event, title: e.target.value })}
          placeholder="Наприклад: Неділя, ранкове або Молитовне"
          className="form_input"
          required
        />
      </label>

      <label>
        <span className="font-satoshi font-semibold text-base text-gray-700">
          Посилання на наше служіння
        </span>
        <input
          value={event.live}
          onChange={(e) => setEvent({ ...event, live: e.target.value })}
          placeholder="Встав посилання"
          className="form_input"
        />
      </label>

      <label>
        <span className="font-satoshi font-semibold text-base text-gray-700">
          Посилання на плейлист для прослуховування
        </span>
        <input
          value={event.playList}
          onChange={(e) => setEvent({ ...event, playList: e.target.value })}
          placeholder="Встав посилання"
          className="form_input"
        />
      </label>

      <DatePickerDemo onDateChange={handleDateChange} />

      {event.songs.map((song, index) => (
        <div key={index} className="flex gap-2 items-end">
          <div className="flex-1">
            <label>
              <span className="font-satoshi font-semibold text-base text-gray-700">
                Пісня {index + 1}
              </span>
              <SongCombobox index={index} />
            </label>
          </div>
          {event.songs.length > 1 && (
            <button
              type="button"
              onClick={() => removeSongSlot(index)}
              className="text-red-500 hover:text-red-700 px-3 py-2"
            >
              Видалити
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addSongSlot}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        + Додати пісню
      </button>

      <div className="flex-end mx-3 mb-5 gap-4">
        <Link
          href="/events"
          className="text-gray-500 hover:text-white text-sm font-medium hover:bg-blue-800 px-5 py-1.5 rounded-full"
        >
          Cancel
        </Link>

        <AgreeModal
          type={"Створи"}
          question={"Впевнений?"}
          descr={"Ти дійсно хочеш створити такий список пісень?"}
          submitting={submitting}
          handleSubmit={handleSubmit}
        />
      </div>
    </form>
  );
};
