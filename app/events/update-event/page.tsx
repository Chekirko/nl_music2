"use client";

import { AgreeModal, EventFormBlock } from "@/components";
import { DatePickerDemo } from "@/components/ui/datePickerDemo";
import { defaultEvent } from "@/constants";
import { EventSong, GettedSong, OurEvent } from "@/types";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const UpdateEventPage = () => {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [songs, setSongs] = useState<GettedSong[]>([]);
  const [event, setEvent] = useState<OurEvent>(defaultEvent);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "";

    const fetchSongs = async () => {
      const response = await fetch("/api/songs", {
        next: { revalidate: 60 },
      });
      const data = await response.json();
      setSongs(data);
    };

    const fetchEvent = async () => {
      const response = await fetch(`/api/events/single?id=${id}`, {
        next: { revalidate: 60 },
      });
      const incomingEvent = await response.json();

      const updatedSongs = defaultEvent.songs.map((defaultSong, index) => {
        const incomingSong = incomingEvent.songs[index];
        if (incomingSong && incomingSong.title !== defaultSong.title) {
          return incomingSong;
        }
        return defaultSong;
      });

      // Оновлення всього об'єкту події, змінилися лише певні пісні
      const updatedEvent = { ...incomingEvent, songs: updatedSongs };
      setEvent(updatedEvent);
    };

    fetchEvent();
    fetchSongs();
  }, []);

  const handleDateChange = (selectedDate: Date | undefined) => {
    const updatedEvent = { ...event, date: selectedDate || undefined };
    setEvent(updatedEvent);
  };

  const updateEvent = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const filteredEventSongs = event.songs.filter((song) => song.title !== "");
    // const sortedEventSongs = filteredEventSongs.sort(
    //   (a, b) => Number(a.ind) - Number(b.ind)
    // );

    const utcDate = event.date ? new Date(event.date).toISOString() : undefined;
    try {
      const response = await fetch("/api/events/update", {
        method: "PUT",
        body: JSON.stringify({
          _id: event._id,
          live: event.live,
          title: event.title,
          songs: filteredEventSongs,
          date: utcDate,
        }),
      });

      if (response.ok) {
        router.push(`/events`);
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

      <form
        className="mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism"
        onSubmit={updateEvent}
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
            Посилання на служіння
          </span>
          <input
            value={event.live}
            onChange={(e) => setEvent({ ...event, live: e.target.value })}
            placeholder="Встав посилання"
            className="form_input"
          />
        </label>

        <DatePickerDemo
          onDateChange={handleDateChange}
          existedDate={event.date}
        />

        {event.songs.map((song, index) => (
          <EventFormBlock
            key={song.song}
            songs={songs}
            event={event}
            setEvent={setEvent}
            index={index}
            song={song}
          />
        ))}

        <div className="flex-end mx-3 mb-5 gap-4">
          <Link
            href={`/events`}
            className="text-gray-500 hover:text-white text-sm font-medium hover:bg-blue-800 px-5 py-1.5 rounded-full"
          >
            Cancel
          </Link>

          <AgreeModal
            type={"Змінити"}
            question={"Впевнений?"}
            descr={"Ти дійсно хочеш змінити цей список пісень?"}
            submitting={submitting}
            handleSubmit={updateEvent}
          />
        </div>
      </form>
    </section>
  );
};

export default UpdateEventPage;
