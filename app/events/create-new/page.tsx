"use client";

import { GettedSong, OurEvent } from "@/types";
import { FormEvent, useEffect, useState } from "react";
import { AgreeModal, EventFormBlock } from "@/components";
import { defaultEvent } from "@/constants";
import { useRouter } from "next/navigation";
import { DatePickerDemo } from "@/components/ui/datePickerDemo";
import Link from "next/link";

const CreateEventPage = () => {
  const router = useRouter();
  const [songs, setSongs] = useState<GettedSong[]>([]);
  const [event, setEvent] = useState<OurEvent>(defaultEvent);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const fetchSongs = async () => {
      const response = await fetch("/api/songs", {
        next: { revalidate: 60 },
      });
      const data = await response.json();
      setSongs(data);
    };

    fetchSongs();
  }, []);

  const handleDateChange = (selectedDate: Date | undefined) => {
    const updatedEvent = { ...event, date: selectedDate || undefined };
    console.log(selectedDate);
    console.log(updatedEvent);
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
    console.log(event.date);
    console.log(utcDate);
    try {
      const response = await fetch("/api/events/new", {
        method: "POST",
        body: JSON.stringify({
          title: event.title,
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
    <section className="padding-x w-full max-w-full flex-start flex-col">
      <h1 className="head_text text-left">
        <span className="blue_gradient">Створи новий список</span>
      </h1>
      <p className="desc text-left max-w-md">
        Вибери необхідні пісні в потрібному порядку
      </p>

      {/* {event.date ? (
        <div>{event.date.toLocaleDateString()}</div>
      ) : (
        <div>{}</div>
      )} */}

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
    </section>
  );
};

export default CreateEventPage;
