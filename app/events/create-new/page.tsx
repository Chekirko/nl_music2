"use client";

import { GettedSong, OurEvent } from "@/types";
import { FormEvent, useEffect, useState } from "react";
import { EventFormBlock } from "@/components";
import { defaultEvent } from "@/constants";
import { useRouter } from "next/navigation";

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

  const createEvent = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const filteredEventSongs = event.songs.filter((song) => song.title !== "");
    const sortedEventSongs = filteredEventSongs.sort(
      (a, b) => Number(a.ind) - Number(b.ind)
    );
    console.log(sortedEventSongs);
    try {
      const response = await fetch("/api/events/new", {
        method: "POST",
        body: JSON.stringify({
          title: event.title,
          songs: sortedEventSongs,
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
        <span className="blue_gradient"> пісню</span>
      </h1>
      <p className="desc text-left max-w-md">
        та слова та акорди пісні, щоб всі були в курсі і ніхто не лажав
      </p>

      <form
        className="mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism"
        onSubmit={createEvent}
      >
        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Назва пісні
          </span>
          <input
            // value={event.songs[0].song}
            // onChange={(e) => setSong({ ...song, title: e.target.value })}
            placeholder="Як ми називаємось?"
            required
            readOnly
            className="form_input"
          />
        </label>

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

        <button type="submit">Створи</button>
      </form>
    </section>
  );
};

export default CreateEventPage;
