"use client";

import { OurEvent } from "@/types";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AgreeModal } from "@/components";
import { useRouter, usePathname } from "next/navigation";
import {
  TelegramShareButton,
  ViberShareButton,
  TelegramIcon,
  ViberIcon,
} from "react-share";

interface SingleEventPageProps {
  params: {
    eventId: string;
  };
}

const SingleEventPage = ({ params }: SingleEventPageProps) => {
  const [event, setEvent] = useState<OurEvent>();
  const [submitting, setSubmitting] = useState(false);
  const session = useSession();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const fetchEvent = async () => {
      const response = await fetch(`/api/events/single?id=${params.eventId}`, {
        next: { revalidate: 60 },
      });
      const event = await response.json();
      setEvent(event);
    };

    fetchEvent();
  }, []);

  const deleteEvent = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/events/delete", {
        method: "DELETE",
        body: JSON.stringify({
          _id: params.eventId,
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
    <section className="padding-x py-5">
      <h1 className="head_text  text-primary-600">{event?.title}</h1>
      <div className="flex flex-col items-start gap-4 mt-8">
        <Link
          href={`/events/update-event?id=${params.eventId}`}
          className="rounded-full  bg-blue-600 hover:bg-blue-800 px-5 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
        >
          Редагувати список
        </Link>
        {session.data?.user.role === "admin" && (
          <AgreeModal
            type={"Видалити список"}
            question={"Впевнений?"}
            descr={"Ти дійсно хочеш видалити такий список пісень?"}
            submitting={submitting}
            handleSubmit={deleteEvent}
          />
        )}
      </div>

      <div className="border-2 mt-10 w-1/5 border-gray-300 rounded"></div>
      <div className="mt-5 font-bold text-lg text-primary-800">
        <p>Дата: </p>
        {event?.date ? new Date(event.date).toLocaleDateString() : "No date"}
      </div>
      <div className="border-2 mt-5 w-1/5 border-gray-300 rounded"></div>
      <ul className="flex flex-col gap-6 mt-10 pl-8 text-lg font-medium">
        {event?.songs &&
          event.songs.map((song, index) => (
            <li key={index}>
              {/* <h2 className="mb-4">Пісня {index}</h2> */}
              <Link
                href={`/songs/${song.song}`}
                className="bg-gray-400 text-white hover:bg-gray-500 text-base font-semibold sm:text-xl sm:font-bold py-1.5 px-4 rounded-full"
              >
                {index}. {song.title}
              </Link>
            </li>
          ))}
      </ul>

      <div className="border-2 mt-10 w-1/5 border-gray-300 rounded"></div>

      <div className="flex flex-start gap-5 mt-10">
        <p className="font-semibold">Поділитись:</p>
        <div className="flex gap-1">
          <TelegramShareButton url={`https://nl-music2.vercel.app/${path}`}>
            <TelegramIcon size={40} round={true}></TelegramIcon>
          </TelegramShareButton>
          <ViberShareButton url={`https://nl-music2.vercel.app/${path}`}>
            <ViberIcon size={40} round={true}></ViberIcon>
          </ViberShareButton>
        </div>
      </div>

      {event?.live ? (
        <>
          <div className="border-2 mt-10 w-1/5 border-gray-300 rounded"></div>
          <div className="mt-8 font-semibold">
            Переглянути служіння:{" "}
            <Link
              href={event.live}
              className="rounded-full ml-4  bg-blue-600 hover:bg-blue-800 px-5 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
            >
              ось тут
            </Link>
          </div>
        </>
      ) : (
        ""
      )}

      {event?.playList ? (
        <>
          <div className="border-2 mt-10 w-1/5 border-gray-300 rounded"></div>
          <h2 className="mt-8 text-[27px] font-semibold orange_gradient">
            Прослухати весь плейлист:{" "}
          </h2>
          <div className="mt-10">
            <iframe
              width="500"
              height="281"
              src={event?.playList}
              title={event.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            ></iframe>
            <style jsx>{`
              @media (max-width: 600px) {
                iframe {
                  width: 100%; /* Ширина на мобільних пристроях */
                }
              }
            `}</style>
          </div>
        </>
      ) : (
        ""
      )}
    </section>
  );
};

export default SingleEventPage;
