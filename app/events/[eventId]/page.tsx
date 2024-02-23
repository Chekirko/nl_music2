"use client";

import { OurEvent } from "@/types";
import Link from "next/link";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AgreeModal } from "@/components";
import { useRouter, usePathname } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  TelegramShareButton,
  ViberShareButton,
  TelegramIcon,
  ViberIcon,
} from "react-share";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const updateEvent = async (updatedEvent: OurEvent) => {
    setSubmitting(true);

    try {
      const response = await fetch("/api/events/update", {
        method: "PUT",
        body: JSON.stringify({
          _id: updatedEvent._id,
          live: updatedEvent.live,
          playList: updatedEvent.playList,
          title: updatedEvent.title,
          songs: updatedEvent.songs,
          date: updatedEvent.date,
        }),
      });

      if (response.ok) {
        toast.success("Список успішно оновлено!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Упс! Щось пішло не так...");
    } finally {
      setSubmitting(false);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const songs = [...event!.songs];
    const [removed] = songs.splice(result.source.index, 1);
    songs.splice(result.destination.index, 0, removed);

    const updatedEvent = { ...event!, songs }; // Update state with new song order
    setEvent(updatedEvent);
    updateEvent(updatedEvent);
    // Trigger a database update here to reflect the new song order
    // ... your code to update the database ...
  };

  const handleDeleteSong = (id: string) => {
    const updatedSongs = event?.songs?.filter((song) => song.song !== id);
    const updatedEvent = { ...event!, songs: updatedSongs! }; // Update state with new song order
    setEvent(updatedEvent);
    updateEvent(updatedEvent);
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

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list">
          {(provided) => (
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col gap-6 mt-10 pl-8 text-lg font-medium"
            >
              {event?.songs &&
                event.songs.map((song, index) => (
                  <Draggable
                    isDragDisabled={
                      !session.data?.user ||
                      session.data?.user.role !== "admin" ||
                      submitting
                    }
                    key={song.song}
                    draggableId={song.song}
                    index={index}
                  >
                    {(provided) => (
                      <li
                        draggable={!submitting}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex justify-start w-fit bg-gray-400 hover:bg-gray-500 rounded-full"
                      >
                        {/* <h2 className="mb-4">Пісня {index}</h2> */}
                        <Link
                          href={`/songs/${song.song}`}
                          className="bg-gray-400 text-white text-base font-semibold sm:text-xl sm:font-bold py-1.5 px-4 rounded-full"
                        >
                          {index}. {song.title}
                        </Link>
                        {session.data?.user &&
                          session.data?.user.role === "admin" && (
                            <AlertDialog>
                              <AlertDialogTrigger className="py-1.5 px-4 rounded-full flex items-center">
                                <AiOutlineClose
                                  size={18}
                                  className="text-blue-800"
                                />
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Ти впевнений?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="font-medium">
                                    Добряче подумай! Ця пісня не така вже й
                                    погана... Нею можна гарно прославити Бога!
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Відміна</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSong(song.song)}
                                  >
                                    Видалити
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                      </li>
                    )}
                  </Draggable>
                ))}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      <div className="border-2 mt-10 w-1/5 border-gray-300 rounded"></div>

      <div className="flex flex-start gap-5 mt-10">
        <p className="font-semibold">Поділитись:</p>
        <div className="flex gap-1">
          <TelegramShareButton
            disabled={submitting}
            url={`https://nl-music2.vercel.app/${path}`}
          >
            <TelegramIcon size={40} round={true}></TelegramIcon>
          </TelegramShareButton>
          <ViberShareButton
            disabled={submitting}
            url={`https://nl-music2.vercel.app/${path}`}
          >
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
      <ToastContainer
        position="bottom-right"
        autoClose={1500} // Закрити автоматично через 3 секунди
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </section>
  );
};

export default SingleEventPage;
