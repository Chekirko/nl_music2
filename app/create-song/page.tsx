"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Form } from "@/components";

const CreateSong = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [song, setSong] = useState({
    title: "",
    comment: "",
    key: "",
    mode: "",
    origin: "",
    video: "",
    ourVideo: "",
    blocks: [
      {
        name: "",
        version: "1",
        lines: "",
        ind: "1",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "2",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "3",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "4",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "5",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "6",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "7",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "8",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "9",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "10",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "11",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "12",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "13",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "14",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "15",
      },
      {
        name: "",
        version: "1",
        lines: "",
        ind: "16",
      },
    ],
  });

  const createSong = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const sortedBlocks = song.blocks
      .filter((block) => block.name !== "")
      .sort((a, b) => Number(a.ind) - Number(b.ind));
    try {
      const response = await fetch("/api/songs/new", {
        method: "POST",
        body: JSON.stringify({
          title: song.title,
          comment: song.comment,
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
      />
    </div>
  );
};

export default CreateSong;
