"use client";

import { GettedSong, OurEvent } from "@/types";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AgreeModal } from "@/components";
import { DatePickerDemo } from "@/components/ui/datePickerDemo";
import { SongCombobox } from "@/components/Events/SongCombobox";
import { useEventStore } from "@/store/eventStore";
import { updateEvent as updateEventAction } from "@/lib/actions/eventActions";

interface Props {
  initialSongs: GettedSong[];
}

import { useSearchParams } from "next/navigation";

export const UpdateEventForm = ({ initialSongs }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    event,
    setEvent,
    setSongs,
    addSongSlot,
    removeSongSlot,
    reset,
  } = useEventStore();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const id = searchParams.get("id") || "";

    reset();
    setSongs(initialSongs);

    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/single?id=${id}`, { cache: 'no-store', signal: controller.signal });
        const incoming = await res.json();
        setEvent({
          title: incoming.title,
          live: incoming.live,
          playList: incoming.playList || "",
          date: incoming.date ? new Date(incoming.date) : undefined,
          songs: incoming.songs || [],
          _id: (incoming as any)._id,
        });
      } catch {}
    };

    fetchEvent();
    return () => { controller.abort(); reset(); };
  }, [initialSongs, setSongs, setEvent, reset, searchParams]);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setEvent({ ...event, date: selectedDate || undefined });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const utcDate = event.date ? new Date(event.date).toISOString() : undefined;

    const result = await updateEventAction({
      _id: (event as any)._id,
      title: event.title,
      live: event.live,
      playList: event.playList || "",
      date: utcDate,
      songs: event.songs,
    });

    setSubmitting(false);

    if (result.success) {
      const id = (event as any)._id;
      reset();
      router.push(`/events/${id}`);
    }
  };

  return (
    <form
      className="mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism"
      onSubmit={handleSubmit}
    >
      <label>
        <span className="font-satoshi font-semibold text-base text-gray-700">
          Назва події
        </span>
        <input
          value={event.title}
          onChange={(e) => setEvent({ ...event, title: e.target.value })}
          placeholder="Наприклад: Неділя, ранкове служіння"
          className="form_input"
          required
        />
      </label>

      <label>
        <span className="font-satoshi font-semibold text-base text-gray-700">
          Посилання на трансляцію
        </span>
        <input
          value={event.live}
          onChange={(e) => setEvent({ ...event, live: e.target.value })}
          placeholder="�'�?�'���? ���?�?��>���?�?�?"
          className="form_input"
        />
      </label>

      <label>
        <span className="font-satoshi font-semibold text-base text-gray-700">
          Плейлист (YouTube embed)
        </span>
        <input
          value={event.playList}
          onChange={(e) => setEvent({ ...event, playList: e.target.value })}
          placeholder="�'�?�'���? ���?�?��>���?�?�?"
          className="form_input"
        />
      </label>

      <DatePickerDemo onDateChange={handleDateChange} existedDate={event.date} />

      {event.songs.map((song, index) => (
        <div key={index} className="flex gap-2 items-end">
          <div className="flex-1">
            <label>
              <span className="font-satoshi font-semibold text-base text-gray-700">
                Трек {index}
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
        + Додати трек
      </button>

      <div className="flex-end mx-3 mb-5 gap-4">
        <Link
          href={`/events/${(event as any)._id}`}
          className="text-gray-500 hover:text-white text-sm font-medium hover:bg-blue-800 px-5 py-1.5 rounded-full"
        >
          Cancel
        </Link>

        <AgreeModal
          type={"Оновити"}
          question={"Підтвердити?"}
          descr={"Після підтвердження подію буде оновлено"}
          submitting={submitting}
          handleSubmit={handleSubmit}
        />
      </div>
    </form>
  );
};

export default UpdateEventForm;

