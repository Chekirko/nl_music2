"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { defaultSong } from "@/constants";
import { Form } from "@/components";
import type { GettedSong } from "@/types";
import { createSongAction } from "@/lib/actions/songActions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const cloneDefaultSong = (): GettedSong =>
  JSON.parse(JSON.stringify(defaultSong)) as GettedSong;

const CreateSongClient = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [song, setSong] = useState<GettedSong>(() => cloneDefaultSong());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const sortedBlocks = [...song.blocks].sort((a, b) => Number(a.ind) - Number(b.ind));

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
        toast.success("Пісню успішно додано!");
        const id = (res as { songId: string }).songId || (res as { song: GettedSong }).song._id;
        router.push(`/songs/${id}`);
      } else {
        if (res.error.includes("Active team")) {
          toast.error("Потрібна активна команда, щоб створити пісню");
        } else if (res.error.includes("already exists")) {
          toast.error("Пісня з такою назвою вже існує у вашій команді");
        } else {
          toast.error(res.error || "Не вдалося створити пісню");
        }
      }
    } catch (error) {
      console.error(error);
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
        handleSubmit={handleSubmit}
        question="Впевнений?"
        descr="Ти дійсно хочеш додати таку пісню? Подумай, може вона не сподобається іншим!"
      />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default CreateSongClient;

