"use client";

import { GettedSong, OurEvent } from "@/types";
import Link from "next/link";
import { AiOutlineClose } from "react-icons/ai";
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
import AddSongToEventBlock from "@/components/forms/AddSongToEventBlock";
import { deleteEvent as deleteEventAction, updateEvent as updateEventAction } from "@/lib/actions/eventActions";

interface Props {
  initialEvent: OurEvent;
  initialSongs: GettedSong[];
}

export const SingleEventClient = ({ initialEvent, initialSongs }: Props) => {
  const [event, setEvent] = useState<OurEvent>(initialEvent);
  const [songs, setSongs] = useState<GettedSong[]>(initialSongs);
  const [selectedSong, setSelectedSong] = useState<GettedSong | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pinned, setPinned] = useState(false);
  const session = useSession();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    setEvent(initialEvent);
    setSongs(initialSongs);
    try {
      const raw = localStorage.getItem("pinnedEvent");
      const data = raw ? JSON.parse(raw) : null;
      setPinned(!!data && data.id === (initialEvent as any)._id);
    } catch {}
  }, [initialEvent, initialSongs]);

  useEffect(() => {
    const readPinned = () => {
      try {
        const raw = localStorage.getItem("pinnedEvent");
        const data = raw ? JSON.parse(raw) : null;
        setPinned(!!data && data.id === (initialEvent as any)._id);
      } catch {
        setPinned(false);
      }
    };

    readPinned();
    const onStorage = () => readPinned();
    const onPinnedChanged = () => readPinned();
    window.addEventListener("storage", onStorage);
    window.addEventListener("pinned-event-changed", onPinnedChanged as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pinned-event-changed", onPinnedChanged as EventListener);
    };
  }, [initialEvent]);

  const toIso = (d?: Date) => (d ? new Date(d).toISOString() : undefined);

  const handleDelete = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await deleteEventAction((event as any)._id);
      if (res.success) router.push(`/events`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const persistUpdate = async (updated: OurEvent) => {
    setSubmitting(true);
    try {
      const res = await updateEventAction({
        _id: (updated as any)._id,
        live: updated.live,
        playList: updated.playList || "",
        title: updated.title,
        songs: updated.songs,
        date: toIso(updated.date),
      });
      if (res.success) toast.success("Зміни збережено!");
    } catch (err) {
      console.error(err);
      toast.error("Упс! Щось пішло не так...");
    } finally {
      setSubmitting(false);
    }
  };

  const emitPinnedChanged = () => {
    try {
      window.dispatchEvent(new CustomEvent("pinned-event-changed"));
    } catch {}
  };

  const handlePinToggle = () => {
    const id = (event as any)._id;
    const title = event.title;
    try {
      if (pinned) {
        localStorage.removeItem("pinnedEvent");
        setPinned(false);
      } else {
        localStorage.setItem("pinnedEvent", JSON.stringify({ id, title }));
        setPinned(true);
      }
      emitPinnedChanged();
    } catch (e) {
      console.error("Failed to update pinned event", e);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination || !event) return;
    const items = [...event.songs];
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    const updatedEvent = { ...event, songs: items };
    setEvent(updatedEvent);
    persistUpdate(updatedEvent);
  };

  const handleDeleteSong = (index: string) => {
    const updatedSongs = event?.songs?.filter((_, ind) => ind.toString() !== index) || [];
    const updatedEvent = { ...event, songs: updatedSongs };
    setEvent(updatedEvent);
    persistUpdate(updatedEvent);
  };

  const handleAddSong = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSong) return;
    const ind = event.songs.length.toString();
    const updatedEventSongs = [
      ...event.songs,
      {
        comment: selectedSong.comment,
        ind: ind,
        song: selectedSong._id.toString(),
        title: selectedSong.title,
      },
    ];
    const updatedEvent: OurEvent = { ...event, songs: updatedEventSongs };
    setEvent(updatedEvent);
    persistUpdate(updatedEvent);
    setSelectedSong(null);
  };

  return (
    <section className="padding-x py-5 max-w-[1600px] mx-auto">
      <h1 className="head_text  text-primary-600">{event?.title}</h1>
      <div className="flex flex-col items-start gap-4 mt-8">
        <Link
          href={`/events/update-event?id=${(event as any)._id}`}
          className="rounded-full  bg-blue-600 hover:bg-blue-800 px-5 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
        >
          Редагувати подію
        </Link>
        {session.data?.user?.role === "admin" && (
          <AgreeModal
            type={"Видалити подію"}
            question={"Підтвердити?"}
            descr={"Після підтвердження подію буде видалено"}
            submitting={submitting}
            handleSubmit={handleDelete}
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
              {event?.songs?.map((song, index) => (
                <Draggable
                  isDragDisabled={
                    !session.data?.user || session.data?.user.role !== "admin" || submitting
                  }
                  key={index}
                  draggableId={index.toString()}
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
                      <Link
                        href={`/songs/${song.song}`}
                        className="bg-gray-400 text-white text-base font-semibold sm:text-xl sm:font-bold py-1.5 px-4 rounded-full"
                      >
                        {index}. {song.title}
                      </Link>
                      {session.data?.user?.role === "admin" && (
                        <AlertDialog>
                          <AlertDialogTrigger className="py-1.5 px-4 rounded-full flex items-center">
                            <AiOutlineClose size={18} className="text-blue-800" />
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white max-sm:w-72">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Видалити пісню?</AlertDialogTitle>
                              <AlertDialogDescription className="font-medium">
                                Дію не можна скасувати. Пісню буде видалено зі списку.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Скасувати</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSong(index.toString())}>
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
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      {/* Small screens pin button below the list */}
      <div className="lg:hidden mt-6">
        <button
          type="button"
          onClick={handlePinToggle}
          className={`w-full rounded-full px-5 py-3 text-sm font-semibold focus:outline-none border-2 transition-colors ${
            pinned
              ? "bg-yellow-500 border-yellow-600 hover:bg-yellow-600 text-white"
              : "bg-white border-blue-600 text-blue-700 hover:bg-blue-50"
          }`}
          aria-pressed={pinned}
        >
          {pinned ? "Відкріпити" : "Закріпити"}
        </button>
      </div>

      {session.data?.user?.role === "admin" && (
        <>
          <div className="border-2 mt-10 w-1/5 border-gray-300 rounded"></div>
          <form onSubmit={handleAddSong} className="mt-10 flex flex-col w-fit items-end gap-2">
            <AddSongToEventBlock
              songs={songs}
              event={event}
              setEvent={setEvent}
              selectedSong={selectedSong}
              setSelectedSong={setSelectedSong}
            />
            <button
              type="submit"
              disabled={!selectedSong}
              className={`rounded-full px-5 py-1.5 w-fit text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${
                !selectedSong ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-800"
              }`}
            >
              Додати
            </button>
          </form>
        </>
      )}

      <div className="border-2 mt-10 w-1/5 border-gray-300 rounded"></div>

      <div className="flex flex-start gap-5 mt-10">
        <p className="font-semibold">Поділитися:</p>
        <div className="flex gap-1">
          <TelegramShareButton disabled={submitting} url={`https://nl-music2.vercel.app/${path}`}>
            <TelegramIcon size={40} round={true}></TelegramIcon>
          </TelegramShareButton>
          <ViberShareButton disabled={submitting} url={`https://nl-music2.vercel.app/${path}`}>
            <ViberIcon size={40} round={true}></ViberIcon>
          </ViberShareButton>
        </div>
      </div>

      {event?.live ? (
        <>
          <div className="border-2 mt-10 w-1/5 border-gray-300 rounded"></div>
          <div className="mt-8 font-semibold">
            Посилання на трансляцію:
            <Link
              href={event.live}
              className="rounded-full ml-4  bg-blue-600 hover:bg-blue-800 px-5 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
            >
              Перейти
            </Link>
          </div>
        </>
      ) : (
        ""
      )}

      {event?.playList ? (
        <>
          <div className="border-2 mt-10 w-1/5 border-gray-300 rounded"></div>
          <h2 className="mt-8 text-[27px] font-semibold orange_gradient">Відео з плейлиста:</h2>
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
                iframe { width: 100%; }
              }
            `}</style>
          </div>
        </>
      ) : (
        ""
      )}

      <ToastContainer position="bottom-right" autoClose={1500} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <button
        type="button"
        onClick={handlePinToggle}
        className={`hidden lg:inline-flex fixed bottom-6 right-6 z-20 shadow-lg rounded-full px-5 py-3 text-sm font-semibold focus:outline-none border-2 transition-colors ${
          pinned
            ? "bg-yellow-500 border-yellow-600 hover:bg-yellow-600 text-white"
            : "bg-white border-blue-600 text-blue-700 hover:bg-blue-50"
        }`}
        aria-pressed={pinned}
        title={pinned ? "Відкріпити подію" : "Закріпити подію"}
      >
        {pinned ? "Відкріпити" : "Закріпити"}
      </button>
    </section>
  );
};

export default SingleEventClient;
