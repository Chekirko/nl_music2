"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form } from "@/components";
import type { GettedSong } from "@/types";
import { updateSongAction } from "@/lib/actions/songActions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Props {
  initialSong: GettedSong;
}

const UpdateSongClient = ({ initialSong }: Props) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [song, setSong] = useState<GettedSong>(initialSong);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await updateSongAction({
        _id: String(song._id),
        title: song.title,
        comment: song.comment,
        rythm: song.rythm,
        tags: song.tags,
        key: song.key,
        mode: song.mode,
        origin: song.origin,
        video: song.video,
        ourVideo: song.ourVideo,
        blocks: song.blocks,
      });
      if (res.success) {
        toast.success("Пісню успішно оновлено!");
        router.push(`/songs/${song._id}`);
      } else {
        toast.error(res.error || "Не вдалося оновити пісню");
      }
    } catch (error) {
      console.error(error);
      toast.error("Сталася помилка при оновленні пісні");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="padding-x max-w-[1600px] mx-auto"> 
      <Form
        type="Оновити"
        song={song}
        setSong={setSong}
        submitting={submitting}
        handleSubmit={handleSubmit}
        question="Підтвердити оновлення?"
        descr="Зміни будуть збережені та застосовані на сторінці пісні."
      />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default UpdateSongClient;

