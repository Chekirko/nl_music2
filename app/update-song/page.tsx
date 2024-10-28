"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Form } from "@/components";
import { GettedSong } from "@/types";
import { defaultSong } from "@/constants";

const UpdateSong = () => {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [song, setSong] = useState<GettedSong>(defaultSong);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "";
    const fetchSong = async () => {
      const response = await fetch(`/api/songs/single?id=${id}`, {
        next: { revalidate: 60 },
      });
      const song = await response.json();
      setSong(song);
    };

    fetchSong();
  }, []);

  const updateSong = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // const sortedBlocks = song.blocks.sort(
    //   (a, b) => Number(a.ind) - Number(b.ind)
    // );
    try {
      const response = await fetch("/api/songs/change", {
        method: "PUT",
        body: JSON.stringify({
          _id: song._id,
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
        }),
      });

      if (response.ok) {
        router.push(`/songs/${song._id}`);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="padding-x max-w-[1600px] mx-auto">
      <Form
        type="Зміни"
        song={song}
        setSong={setSong}
        submitting={submitting}
        handleSubmit={updateSong}
        question="Впевнений?"
        descr="Ти дійсно хочеш змінити цю пісню? Раджу тобі добре подумати, щоб не було проблем з іншими музикантами!"
      />
    </div>
  );
};

export default UpdateSong;
