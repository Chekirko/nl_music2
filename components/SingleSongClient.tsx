"use client";
import { SongLink } from "@/components";
import { Block, GettedSong } from "@/types";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { EditSongBlockDialog } from "@/components/EditSongBlockDialog";
import {
  MusicalNoteIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  CheckIcon,
  TableCellsIcon,
  DeviceTabletIcon,
} from "@heroicons/react/24/outline";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TonalChanger from "@/components/TonalChanger";
import AlertDialogForSongPage from "@/components/AlertDialogForSongPage";
import AgreeModal from "@/components/AgreeModal";
import { replaceBadChords, pureTranspose, changeChordsByTonal } from "@/lib/chords";
import EditTonalModal from "@/components/EditTonalModal";
import { createProgression } from "@/lib/progression";
import { updateSongAction, deleteSong as deleteSongAction } from "@/lib/actions/songActions";

interface Props {
  id: string;
  initialSong: GettedSong;
}

const SingleSongClient = ({ id, initialSong }: Props) => {
  const router = useRouter();
  const session = useSession();

  const [song, setSong] = useState<GettedSong>(initialSong);
  const [viewText, setViewText] = useState(true);
  const [viewChords, setViewChords] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [twoColumns, setTwoColumns] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOriginTonal, setIsOriginTonal] = useState(true);
  const [progression, setProgression] = useState<string[]>(createProgression(initialSong.key));
  const [currentTonal, setCurrentTonal] = useState<string>(initialSong.key);
  const [renderedBlocks, setRenderedBlocks] = useState<Block[] | undefined>(
    initialSong.blocks.filter((block: Block) => block.name !== "")
  );

  const handleDeleteSong = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await deleteSongAction(id);
      if (res.success) {
        toast.success("Пісню видалено");
        router.push("/songs");
      } else {
        toast.error(res.error || "Помилка видалення");
      }
    } catch (error) {
      console.log(error);
      toast.error("Не вдалося видалити пісню");
    } finally {
      setSubmitting(false);
    }
  };

  const sortBlocks = () => {
    const blocks = song?.blocks.filter((block: Block) => block.name !== "");
    return blocks;
  };

  const handleViewChords = () => {
    if (viewChords && viewText) {
      const updatedBlocks = renderedBlocks?.map((block) => {
        if (Number(block.version) === 1) {
          const filteredLines = block.lines
            .split("\n")
            .filter((_, i) => i % 2 !== 0);
          return { ...block, lines: filteredLines.join("\n") };
        } else if (Number(block.version) === 2) {
          return block;
        } else if (Number(block.version) === 3) {
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
  };

  const changeTonal = (interval: string, tonal: string, type?: string) => {
    if (!viewText || !viewChords) return;
    const updatedBlocks = renderedBlocks?.map((block) => {
      if (Number(block.version) === 1) {
        const lines = block.lines.split("\n");
        const modifiedLines = lines.map((line, index) => {
          if (index % 2 === 0) {
            const parts = line.split(" ");
            const newParts = parts.map((c) => pureTranspose(c, interval));
            const cleanedNewParts = replaceBadChords(newParts);
            const finishedParts = changeChordsByTonal(tonal, cleanedNewParts);
            return finishedParts.join(" ");
          } else {
            return line;
          }
        });
        return { ...block, lines: modifiedLines.join("\n") };
      } else if (Number(block.version) === 3) {
        const lines = block.lines.split("\n");
        const modifiedLines = lines.map((line) => {
          const parts = line.split(" ");
          const newParts = parts.map((c) => pureTranspose(c, interval));
          const cleanedNewParts = replaceBadChords(newParts);
          const finishedParts = changeChordsByTonal(tonal, cleanedNewParts);
          return finishedParts.join(" ");
        });
        return { ...block, lines: modifiedLines.join("\n") };
      } else {
        return block;
      }
    });
    const updatedSong = {
      ...song!,
      blocks: updatedBlocks!,
      ...(type === "save" && { key: tonal }),
    } as GettedSong;

    const newProgression = createProgression(tonal);
    setIsOriginTonal(false);
    setProgression(newProgression);
    setRenderedBlocks(updatedBlocks);
    setSong(updatedSong);
    setCurrentTonal(tonal);

    if (type === "save") updateSong(updatedSong);
  };

  const handleCopyBlocks = () => {
    const blocksText = renderedBlocks?.map((block) => `${block.name}\n${block.lines}`).join("\n\n");
    const finalText = `${song?.title}\n\n${blocksText}`;
    navigator.clipboard.writeText(finalText).then(
      () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      },
      (err) => {
        console.error("Не вдалося скопіювати", err);
      }
    );
  };

  const updateSong = async (updated: GettedSong) => {
    setSubmitting(true);
    try {
      const res = await updateSongAction({
        _id: String(updated._id),
        title: updated.title,
        comment: updated.comment,
        rythm: updated.rythm,
        tags: updated.tags,
        key: updated.key,
        mode: updated.mode,
        origin: updated.origin,
        video: updated.video,
        ourVideo: updated.ourVideo,
        blocks: updated.blocks,
      });
      if (res.success) {
        toast.success("Тональність/блоки оновлено!");
      } else {
        toast.error(res.error || "Не вдалося оновити пісню");
      }
    } catch (error) {
      toast.error("Упс! Щось пішло не так...");
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination || !isOriginTonal) return;
    const updatedBlocks = Array.from(renderedBlocks!);
    const [reorderedBlock] = updatedBlocks.splice(result.source.index, 1);
    updatedBlocks.splice(result.destination.index, 0, reorderedBlock);
    setRenderedBlocks(updatedBlocks);
    const updatedSong = { ...song!, blocks: updatedBlocks } as GettedSong;
    setSong(updatedSong);
    updateSong(updatedSong);
  };

  const handleDoubleBlock = (index: number) => {
    if (!renderedBlocks || !isOriginTonal) return;
    const newBlock = { ...renderedBlocks[index] };
    const updatedBlocks = [...renderedBlocks];
    updatedBlocks.splice(index + 1, 0, newBlock);
    setRenderedBlocks(updatedBlocks);
    const updatedSong = { ...song!, blocks: updatedBlocks } as GettedSong;
    setSong(updatedSong);
    updateSong(updatedSong);
  };

  const handleDeleteBlock = (index: number) => {
    if (!renderedBlocks || !song) return;
    const updatedBlocks = [...renderedBlocks];
    updatedBlocks.splice(index, 1);
    setRenderedBlocks(updatedBlocks);
    const updatedSong = { ...song, blocks: updatedBlocks } as GettedSong;
    setSong(updatedSong);
    updateSong(updatedSong);
  };

  const handleUpdateBlock = (index: number, block: Block) => {
    if (!renderedBlocks || !song || !isOriginTonal) return;
    const updatedBlocks = [...renderedBlocks];
    updatedBlocks[index] = block;
    setRenderedBlocks(updatedBlocks);
    const updatedSong = { ...song, blocks: updatedBlocks } as GettedSong;
    setSong(updatedSong);
    updateSong(updatedSong);
  };

  const tags = song?.tags !== "" ? song?.tags?.split(" ") : null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="padding-x max-w-[1600px] mx-auto">
        <h1 className="head_text  text-blue-600">{song?.title}</h1>
        <div className="flex flex-start gap-8 mt-5">
          <button className="bg-blue-100 hover:bg-blue-200 w-12 h-12 rounded-full flex flex-center" onClick={handleViewChords}>
            <MusicalNoteIcon className="w-8 h-8 text-gray-500" />
          </button>
          <button className="bg-blue-100 hover:bg-blue-200 w-12 h-12 rounded-full flex flex-center" onClick={handleViewText}>
            <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-gray-500" />
          </button>
          <button className="bg-blue-100 hover:bg-blue-200 w-12 h-12 rounded-full flex flex-center" onClick={() => setTwoColumns((v) => !v)}>
            {twoColumns ? (
              <DeviceTabletIcon className="w-8 h-8 text-gray-500" />
            ) : (
              <TableCellsIcon className="w-8 h-8 text-gray-500" />
            )}
          </button>
          <button className="bg-blue-100 hover:bg-blue-200 w-12 h-12 rounded-full flex flex-center" onClick={handleCopyBlocks}>
            {isCopied ? (
              <CheckIcon className="w-8 h-8 text-gray-500" />
            ) : (
              <DocumentTextIcon className="w-8 h-8 text-gray-500" />
            )}
          </button>
        </div>
        <div className="border-2 mt-5 w-1/5 border-gray-300 rounded"></div>
        <p className="mt-5">Початкова тональність: {song?.key}</p>
        {session.data?.user && session.data?.user.role === "admin" && (
          <div className="sm:flex items-center flex-wrap gap-x-4">
            <div>Змінити початкову тональність</div>
            <EditTonalModal
              type={"Змінити"}
              question={"Змінити і зберегти початкову тональність?"}
              descr={""}
              submitting={submitting}
              changeTonal={changeTonal}
              progression={progression}
              currentTonal={currentTonal}
            />
          </div>
        )}

        {song?.rythm && song.rythm !== "" && <p>Ритм: {song.rythm}</p>}
        {song?.comment && song.comment !== "" && <p>Коментар: {song.comment}</p>}
        {song?.mode && song.mode !== "" && <p>Режим: {song.mode}</p>}
        {song?.origin && song.origin !== "" && (
          <p>
            Джерело:{" "}
            <Link href={song.origin} className="font-semibold blue_gradient">
              перейти...
            </Link>
          </p>
        )}
        <div className="border-2 my-5 w-1/5 border-gray-300 rounded"></div>
        <div className="flex flex-wrap gap-2">
          {tags && tags.map((tag) => (
            <button
              className="px-5 py-1.5 text-sm bg-blue-600 hover:bg-blue-800 rounded-full text-white"
              key={tag}
              type="button"
              onClick={() => router.push(`/songs/tags/${tag}?forwardedTag=${tag}`)}
            >
              {tag}
            </button>
          ))}
        </div>
        {tags && <div className="border-2 my-5 w-1/5 border-gray-300 rounded"></div>}

        <TonalChanger progression={progression} currentTonal={currentTonal!} changeTonal={changeTonal} submitting={submitting} />

        <div>
          <div className={`columns-1 ${twoColumns ? "md:columns-2 gap-4" : ""}`}>
            {(!viewChords && viewText) && renderedBlocks?.map((block, index) => (
              <div key={index} className="mb-6 relative break-inside-avoid border border-blue-500 rounded-md p-4 w-fit bg-white">
                <h3 className="font-semibold text-blue-900 mb-1 underline">{block.name}</h3>
                {block.lines.split("\n").map((line, i) => (
                  <p key={i} className="ps-2">{line}</p>
                ))}
              </div>
            ))}
          </div>

          <div className={`columns-1 ${twoColumns ? "md:columns-2 gap-4" : ""}`}>
            {(!viewText && viewChords) && renderedBlocks?.map((block, index) => (
              <div key={index} className="mb-6 relative break-inside-avoid border border-blue-500 rounded-md p-4 w-fit bg-white">
                <h3 className="font-semibold text-blue-900 mb-1 underline">{block.name}</h3>
                {block.lines.split("\n").map((line, i) => (
                  <p key={i} className="blue_gradient font-semibold ps-2">{line}</p>
                ))}
              </div>
            ))}
          </div>

          <Droppable droppableId="blocks">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className={`columns-1 ${twoColumns ? "md:columns-2 gap-4" : ""}`}>
                {(viewChords && viewText) && renderedBlocks?.map((block, index) => {
                  const lines = block.lines.split("\n");
                  const renderLines = lines.map((line, i) => {
                    let style: string | undefined;
                    if (Number(block.version) === 1) {
                      style = i % 2 === 0 ? "blue_gradient font-semibold ps-2" : "ps-2";
                    } else if (Number(block.version) === 2) {
                      style = "ps-2";
                    } else if (Number(block.version) === 3) {
                      style = "blue_gradient font-semibold ps-2";
                    }
                    return (
                      <p key={i} className={style}>{line}</p>
                    );
                  });

                  return (
                    <Draggable
                      isDragDisabled={!session.data?.user || session.data?.user.role !== "admin" || submitting}
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
                          className="mb-6 relative break-inside-avoid border border-blue-500 rounded-md p-4 w-fit bg-white"
                        >
                          <div className="flex justify-between gap-10 mb-3">
                            <h3 className="font-semibold text-blue-900 underline">{block.name}</h3>
                            {session.data?.user && session.data?.user.role === "admin" && (
                              <div className="flex gap-3">
                                <AlertDialogForSongPage
                                  type={1}
                                  text={"Це додасть копію цього блоку?"}
                                  action={"Подвоїти"}
                                  handleUpdateBlock={handleDoubleBlock}
                                  index={index}
                                />
                                <EditSongBlockDialog
                                  handleUpdateBlock={handleUpdateBlock}
                                  index={index}
                                  block={block}
                                />
                                <AlertDialogForSongPage
                                  type={2}
                                  text={"Видалити цей блок без можливості відновлення?"}
                                  action={"Видалити"}
                                  handleUpdateBlock={handleDeleteBlock}
                                  index={index}
                                />
                              </div>
                            )}
                          </div>

                          {renderLines}
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
          <SongLink route="/update-song" type="Змінити пісню" id={id} />
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
              iframe { width: 100%; }
            }
          `}</style>
        </div>
        {session.data?.user?.role === "admin" && (
          <div className="mt-6">
            <AgreeModal
              type="Видалити пісню"
              question="Видалити пісню без можливості відновлення?"
              descr="Цю дію не можна скасувати."
              submitting={submitting}
              handleSubmit={handleDeleteSong}
            />
          </div>
        )}
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </div>
    </DragDropContext>
  );
};

export default SingleSongClient;
