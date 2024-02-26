"use client";
import { SongLink } from "@/components";
import { songData } from "@/constants/scheduleData";
import { Block, GettedSong } from "@/types";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import EditSongBlockModal from "@/components/EditSongBlockModal";
import {
  MusicalNoteIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { PencilSquareIcon } from "@heroicons/react/20/solid";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import AlertDialogForSongPage from "@/components/AlertDialogForSongPage";

interface SingleSongPageProps {
  params: {
    slug: string;
  };
}

const SingleSongPage = ({ params }: SingleSongPageProps) => {
  const router = useRouter();
  const session = useSession();
  const [song, setSong] = useState<GettedSong>();
  const [viewText, setViewText] = useState(true);
  const [viewChords, setViewChords] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCloseModal = () => {
    setIsDropdownOpen(false);
  };

  const [renderedBlocks, setRenderedBlocks] = useState<Block[] | undefined>();

  useEffect(() => {
    const fetchSong = async () => {
      const response = await fetch(`/api/songs/single?id=${params.slug}`, {
        next: { revalidate: 60 },
      });
      const song = await response.json();
      const blocks = song?.blocks.filter((block: Block) => block.name !== "");

      setSong(song);
      setRenderedBlocks(blocks);
    };

    fetchSong();
  }, []);

  const sortBlocks = () => {
    const blocks = song?.blocks.filter((block: Block) => block.name !== "");
    return blocks;
  };

  const handleViewChords = () => {
    if (viewChords && viewText) {
      const updatedBlocks = renderedBlocks?.map((block) => {
        if (Number(block.version) === 1) {
          // Версія 1: залишити тільки парні рядки
          const filteredLines = block.lines
            .split("\n")
            .filter((_, i) => i % 2 !== 0);
          return { ...block, lines: filteredLines.join("\n") };
        } else if (Number(block.version) === 2) {
          // Версія 2: залишити всі рядки
          return block;
        } else if (Number(block.version) === 3) {
          // Версія 3: видалити всі рядки
          return { ...block, lines: "" };
        }
        return block;
      });

      setRenderedBlocks(updatedBlocks);
      setViewChords(!viewChords);
    } else if (!viewChords && viewText) {
      setRenderedBlocks(() => sortBlocks());
      setViewChords(true);
    }
    return;
  };

  const handleViewText = () => {
    if (viewText && viewChords) {
      const updatedBlocks = renderedBlocks?.map((block) => {
        if (Number(block.version) === 1) {
          const filteredLines = block.lines
            .split("\n")
            .filter((_, i) => i % 2 === 0);
          return { ...block, lines: filteredLines.join("\n") };
        } else if (Number(block.version) === 2) {
          return { ...block, lines: "" };
        } else if (Number(block.version) === 3) {
          return block;
        }
        return block;
      });

      setRenderedBlocks(updatedBlocks);
      setViewText(!viewText);
    } else if (viewChords && !viewText) {
      setRenderedBlocks(() => sortBlocks());
      setViewText(true);
    }
    return;
  };

  const handleCopyBlocks = () => {
    // Отримайте текстовий вміст renderedBlocks
    const blocksText = renderedBlocks
      ?.map((block) => `${block.name}\n${block.lines}`)
      .join("\n\n");

    // Додайте заголовок пісні перед вмістом блоків
    const finalText = `${song?.title}\n\n${blocksText}`;

    // Використовуйте новий API для копіювання тексту у буфер обміну
    navigator.clipboard.writeText(finalText).then(
      () => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 3000);
      },
      (err) => {
        console.error("Копіювання не вдалося", err);
      }
    );
  };

  const updateSong = async (song: GettedSong) => {
    setSubmitting(true);

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
        toast.success("Пісню успішно оновлено!");
      }
    } catch (error) {
      toast.error("Упс! Щось пішло не так...");
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const updatedBlocks = Array.from(renderedBlocks!);
    const [reorderedBlock] = updatedBlocks.splice(result.source.index, 1);
    updatedBlocks.splice(result.destination.index, 0, reorderedBlock);

    setRenderedBlocks(updatedBlocks);

    const updatedSong = {
      ...song!,
      blocks: updatedBlocks,
    };
    setSong(updatedSong);
    updateSong(updatedSong);
  };

  const handleDoubleBlock = (index: number) => {
    if (!renderedBlocks) return;

    const newBlock = { ...renderedBlocks[index] };
    const updatedBlocks = [...renderedBlocks];
    updatedBlocks.splice(index + 1, 0, newBlock);

    setRenderedBlocks(updatedBlocks);

    const updatedSong = {
      ...song!,
      blocks: updatedBlocks,
    };

    setSong(updatedSong);
    updateSong(updatedSong);
  };

  const handleDeleteBlock = (index: number) => {
    if (!renderedBlocks || !song) return;
    const updatedBlocks = [...renderedBlocks];
    updatedBlocks.splice(index, 1);

    setRenderedBlocks(updatedBlocks);

    const updatedSong = {
      ...song,
      blocks: updatedBlocks,
    };
    setSong(updatedSong);
    updateSong(updatedSong);
  };

  const handleUpdateBlock = (index: number, block: Block) => {
    if (!renderedBlocks || !song) return;
    const updatedBlocks = [...renderedBlocks];
    updatedBlocks[index] = block;

    setRenderedBlocks(updatedBlocks);

    const updatedSong = {
      ...song,
      blocks: updatedBlocks,
    };
    setSong(updatedSong);

    updateSong(updatedSong);
    setIsDropdownOpen(false);
  };

  const tags = song?.tags !== "" ? song?.tags?.split(" ") : null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="padding-x">
        <h1 className="head_text  text-blue-600">{song?.title}</h1>
        <div className="flex flex-start gap-8 mt-5">
          <button
            className="bg-blue-100 hover:bg-blue-200 w-12 h-12 rounded-full flex flex-center"
            onClick={handleViewChords}
          >
            <MusicalNoteIcon className="w-8 h-8 text-gray-500" />
          </button>
          <button
            className="bg-blue-100 hover:bg-blue-200 w-12 h-12 rounded-full flex flex-center"
            onClick={handleViewText}
          >
            <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-gray-500" />
          </button>
          <button
            className="bg-blue-100 hover:bg-blue-200 w-12 h-12 rounded-full flex flex-center"
            onClick={handleCopyBlocks}
          >
            {isCopied ? (
              <CheckIcon className="w-8 h-8 text-gray-500" />
            ) : (
              <DocumentTextIcon className="w-8 h-8 text-gray-500" />
            )}
          </button>
        </div>
        <div className="border-2 mt-5 w-1/5 border-gray-300 rounded"></div>
        <p className="mt-5">Тональність: {song?.key}</p>
        {song?.rythm && song.rythm !== "" && <p>Темп: {song.rythm}</p>}
        {song?.comment && song.comment !== "" && (
          <p>Коментар: {song.comment}</p>
        )}
        {song?.mode && song.mode !== "" && <p>Модуляція: {song.mode}</p>}
        {song?.origin && song.origin !== "" && (
          <p>
            Оригінал пісні:{" "}
            <Link href={song.origin} className="font-semibold blue_gradient">
              перейти...
            </Link>
          </p>
        )}
        <div className="border-2 my-5 w-1/5 border-gray-300 rounded"></div>
        <div className="flex flex-wrap gap-2">
          {tags &&
            tags.map((tag) => (
              <button
                className="px-5 py-1.5 text-sm bg-blue-600 hover:bg-blue-800 rounded-full text-white"
                key={tag}
                type="button"
                onClick={() => {
                  router.push(`/songs/tags/${tag}?forwardedTag=${tag}`);
                }}
              >
                {tag}
              </button>
            ))}
        </div>
        {tags && (
          <div className="border-2 my-5 w-1/5 border-gray-300 rounded"></div>
        )}

        <div>
          {!viewChords &&
            viewText &&
            renderedBlocks?.map((block, index) => {
              return (
                <div key={index} className="mb-6">
                  <h3 className="font-semibold text-blue-900 mb-1 underline">
                    {block.name}
                  </h3>
                  {block.lines.split("\n").map((line, i) => {
                    return (
                      <p key={i} className="ps-2">
                        {line}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          {!viewText &&
            viewChords &&
            renderedBlocks?.map((block, index) => {
              return (
                <div key={index} className="mb-6">
                  <h3 className="font-semibold text-blue-900 mb-1 underline">
                    {block.name}
                  </h3>
                  {block.lines.split("\n").map((line, i) => {
                    return (
                      <p key={i} className="blue_gradient font-semibold ps-2">
                        {line}
                      </p>
                    );
                  })}
                </div>
              );
            })}

          <Droppable droppableId="blocks">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {viewChords &&
                  viewText &&
                  renderedBlocks?.map((block, index) => {
                    const lines = block.lines.split("\n");
                    const renderLines = lines.map((line, i) => {
                      let style;

                      if (Number(block.version) === 1) {
                        if (i % 2 === 0) {
                          style = "blue_gradient font-semibold ps-2"; // Парні рядки версії 1
                        } else {
                          style = "ps-2"; // Непарні рядки версії 1
                        }
                      } else if (Number(block.version) === 2) {
                        style = "ps-2"; // Версія 2
                      } else if (Number(block.version) === 3) {
                        style = "blue_gradient font-semibold ps-2"; // Версія 3
                      }
                      return (
                        <p key={i} className={style}>
                          {line}
                        </p>
                      );
                    });

                    return (
                      <Draggable
                        isDragDisabled={
                          !session.data?.user ||
                          session.data?.user.role !== "admin" ||
                          submitting
                        }
                        key={index}
                        draggableId={index.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            draggable={!submitting}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-6 relative border border-blue-500 rounded-md p-4 w-fit bg-white"
                          >
                            <h3 className="font-semibold text-blue-900 mb-1 underline">
                              {block.name}
                            </h3>
                            {renderLines}
                            {session.data?.user &&
                              session.data?.user.role === "admin" && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    onClick={() => setIsDropdownOpen(true)}
                                    className="absolute right-4 top-4"
                                  >
                                    <PencilSquareIcon className="w-6 h-6 text-gray-400" />
                                  </DropdownMenuTrigger>
                                  {isDropdownOpen && (
                                    <DropdownMenuContent className="bg-white rounded-lg border border-blue-600">
                                      <DropdownMenuLabel className="r rounded-lg bg-blue-400">
                                        Ти можеш:
                                      </DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="hover:text-white hover:bg-blue-700 rounded-md">
                                        <button
                                          onClick={() =>
                                            handleDoubleBlock(index)
                                          }
                                        >
                                          Дублювати
                                        </button>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="hover:text-white hover:bg-blue-700 rounded-md">
                                        <AlertDialogForSongPage
                                          handleDeleteBlock={handleDeleteBlock}
                                          index={index}
                                        />
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="hover:text-white hover:bg-blue-700 rounded-md">
                                        <EditSongBlockModal
                                          handleUpdateBlock={handleUpdateBlock}
                                          index={index}
                                          block={block}
                                        />
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  )}
                                </DropdownMenu>
                              )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 p-2 rounded w-max mb-6">
          <SongLink
            route="/update-song"
            type="Змінити пісню"
            id={params.slug}
          ></SongLink>
        </div>
        <div className="border-2 mb-6 w-1/5 border-gray-300 rounded"></div>
        <div>
          <iframe
            width="500"
            height="281"
            src={song?.video}
            title={song?.title}
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
        <ToastContainer
          position="bottom-right"
          autoClose={3000} // Закрити автоматично через 3 секунди
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </DragDropContext>
  );
};

export default SingleSongPage;
