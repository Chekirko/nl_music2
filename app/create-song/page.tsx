"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultSong } from "@/constants";
import { Form } from "@/components";
import { createSongAction } from "@/lib/actions/songActions";
import { toast } from "react-toastify";

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
      const res = await createSongAction({
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
      });
      if (res.success) {
        router.push(`/songs/${(res.song as any)._id}`);
      } else {
        if (res.error.includes("Active team")) {
          toast.error("Потрібна активна команда, щоб створити пісню");
        } else if (res.error.includes("already exists")) {
          toast.error("Пісня з такою назвою вже існує у вашій команді");
        } else {
          toast.error("Не вдалося створити пісню");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Сталася помилка при створенні пісні");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="padding-x max-w-[1600px] mx-auto">
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
