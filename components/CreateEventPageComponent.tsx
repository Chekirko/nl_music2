"use client";

import { GettedSong, OurEvent } from "@/types";
import { FormEvent, useEffect, useState } from "react";
import { AgreeModal, EventFormBlock } from "@/components";
import { defaultEvent } from "@/constants";
import { useRouter } from "next/navigation";
import { DatePickerDemo } from "@/components/ui/datePickerDemo";
import Link from "next/link";

const CreateEventPageComponent = () => {
  const router = useRouter();
  const [songs, setSongs] = useState<GettedSong[]>([]);
  const [event, setEvent] = useState<OurEvent>(defaultEvent);
  const [submitting, setSubmitting] = useState(false);

  const fetchSongs = async () => {
    const response = await fetch("/api/songs", {
      next: { revalidate: 60 },
    });
    const data = await response.json();
    setSongs(data);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleDateChange = (selectedDate: Date | undefined) => {
    const updatedEvent = { ...event, date: selectedDate || undefined };

    setEvent(updatedEvent);
  };

  const createEvent = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const filteredEventSongs = event.songs.filter((song) => song.title !== "");
    const sortedEventSongs = filteredEventSongs.sort(
      (a, b) => Number(a.ind) - Number(b.ind)
    );

    const utcDate = event.date ? new Date(event.date).toISOString() : undefined;
    try {
      const response = await fetch("/api/events/new", {
        method: "POST",
        body: JSON.stringify({
          playList: event.playList,
          title: event.title,
          live: event.live,
          songs: sortedEventSongs,
          date: utcDate,
        }),
      });

      if (response.ok) {
        router.push("/events");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form
      className="mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism"
      onSubmit={createEvent}
    >
      <label>
        <span className="font-satoshi font-semibold text-base text-gray-700">
          Тип служіння
        </span>
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
        <EventFormBlock
          key={index}
          songs={songs}
          event={event}
          setEvent={setEvent}
          index={index}
          song={song}
        />
      ))}

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
          handleSubmit={createEvent}
        />
      </div>
    </form>
  );
};

export default CreateEventPageComponent;
