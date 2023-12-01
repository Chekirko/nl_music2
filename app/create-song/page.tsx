"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultSong } from "@/constants";
import { Form } from "@/components";

const CreateSong = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [song, setSong] = useState(defaultSong);

  const createSong = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const sortedBlocks = song.blocks.sort(
      (a, b) => Number(a.ind) - Number(b.ind)
    );
    try {
      const response = await fetch("/api/songs/new", {
        method: "POST",
        body: JSON.stringify({
          title: song.title,
          comment: song.comment,
          rythm: song.rythm,
          tags: song.tags,
          key: song.key,
          mode: song.mode,
          origin: song.origin,
          video: song.video,
          ourVideo: song.ourVideo,
          blocks: sortedBlocks,
        }),
      });

      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="padding-x">
      <Form
        type="Додай"
        song={song}
        setSong={setSong}
        submitting={submitting}
        handleSubmit={createSong}
        question="Впевнений?"
        descr="Ти дійсно хочеш додати таку пісню? Подумай, може вона не сподобається іншим!"
      />
    </div>
  );
};

export default CreateSong;
