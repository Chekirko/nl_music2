"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import { checkCanCreateSongAction, createSongAction } from "@/lib/actions/songActions";
import type { GettedSong } from "@/types";

interface ParsedSongData {
  title: string;
  key: string;
  origin: string;
  video: string;
  blocks: Array<{
    name: string;
    version: number;
    lines: string;
    ind: number;
  }>;
}

const AddByLinkPage = () => {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);

  // Conflict dialog state
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [existingSong, setExistingSong] = useState<GettedSong | null>(null);
  const [parsedData, setParsedData] = useState<ParsedSongData | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      const canCreate = await checkCanCreateSongAction();
      if (!canCreate) {
        router.push("/denied");
      } else {
        setCheckingPermission(false);
      }
    };
    checkPermission();
  }, [router]);

  const validateUrl = (value: string) => {
    try {
      const u = new URL(value);
      return !!u.protocol && !!u.host;
    } catch {
      return false;
    }
  };

  const createSong = async (data: ParsedSongData, titleOverride?: string) => {
    const createResult = await createSongAction({
      title: titleOverride || data.title,
      key: data.key,
      origin: data.origin,
      video: data.video,
      ourVideo: "",
      comment: "",
      rythm: "",
      tags: [],
      mode: "",
      blocks: data.blocks,
    });

    if (!createResult.success) {
      if (createResult.existing) {
        // Conflict - song with same title exists
        setExistingSong(createResult.existing);
        setParsedData(data);
        setNewTitle(titleOverride || data.title);
        setConflictDialogOpen(true);
        if (titleOverride) {
          setTitleError("Ця назва також зайнята. Спробуйте іншу.");
        }
        return false;
      }
      throw new Error(createResult.error || "Не вдалося створити пісню.");
    }

    router.push(`/songs/${createResult.songId}`);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateUrl(url)) {
      setError("Посилання недійсне. Перевірте URL і спробуйте ще раз.");
      return;
    }
    setSubmitting(true);
    try {
      // Step 1: Parse the page via API
      const res = await fetch("/api/songs/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data: ParsedSongData | { error: string } = await res.json();
      if (!res.ok) {
        setError((data as { error: string })?.error || "Не вдалося опрацювати посилання.");
        return;
      }

      // Step 2: Create the song via server action
      await createSong(data as ParsedSongData);
    } catch (err: any) {
      setError(err.message || "Сталася помилка мережі. Спробуйте ще раз пізніше.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveWithNewTitle = async () => {
    if (!parsedData) return;
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setTitleError("Введіть нову назву пісні");
      return;
    }
    setSubmitting(true);
    setTitleError(null);
    try {
      await createSong(parsedData, trimmed);
    } catch (err: any) {
      setError(err.message || "Не вдалося створити пісню.");
      setConflictDialogOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setConflictDialogOpen(false);
    setExistingSong(null);
    setParsedData(null);
    setTitleError(null);
  };

  if (checkingPermission) {
    return (
      <section className="padding-x max-w-[1600px] mx-auto w-full flex-center">
        <p>Перевірка дозволів...</p>
      </section>
    );
  }

  return (
    <section className="padding-x max-w-[1600px] mx-auto w-full flex-start flex-col">
      <h1 className="head_text text-left">
        <span className="blue_gradient">Додати пісню за посиланням</span>
      </h1>
      <p className="desc text-left max-w-md mb-8">
        Вставте посилання на сторінку з піснею. Ми спробуємо проаналізувати її і створити пісню автоматично.
      </p>

      <form className="mt-6 w-full max-w-2xl flex flex-col gap-5 glassmorphism" onSubmit={handleSubmit}>
        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">Посилання</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="form_input"
            required
            inputMode="url"
          />
        </label>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex-end mx-3 mb-5 gap-4">
          <button
            type="submit"
            disabled={submitting}
            className={`rounded-full px-5 py-1.5 text-sm font-medium text-white ${
              submitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-800"
            }`}
          >
            {submitting ? "Опрацьовуємо..." : "Створити"}
          </button>
        </div>
      </form>

      {/* Conflict resolution dialog */}
      <Transition appear show={conflictDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseDialog}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Пісня з такою назвою вже існує
                  </Dialog.Title>
                  <p className="mt-2 text-sm text-gray-600">
                    У вашій команді вже є пісня "{existingSong?.title}". Якщо це інша пісня, введіть іншу назву.
                  </p>

                  {existingSong && existingSong.blocks && existingSong.blocks.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700">Фрагмент існуючої пісні:</p>
                      <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4 max-h-64 overflow-y-auto">
                        {existingSong.blocks.slice(0, 3).map((block, index) => (
                          <div key={`${block.name}-${index}`} className="mb-4 last:mb-0">
                            <p className="text-sm font-semibold text-blue-900">{block.name || `Блок ${index + 1}`}</p>
                            <pre className="whitespace-pre-wrap break-words text-xs text-gray-700">{block.lines}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <label htmlFor="new-song-title" className="block text-sm font-medium text-gray-700">
                      Нова назва пісні
                    </label>
                    <input
                      id="new-song-title"
                      type="text"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Наприклад: Назва (інша версія)"
                    />
                    {titleError && <p className="mt-1 text-sm text-red-600">{titleError}</p>}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={handleCloseDialog}
                      disabled={submitting}
                    >
                      Скасувати
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                      onClick={handleSaveWithNewTitle}
                      disabled={submitting}
                    >
                      {submitting ? "Збереження..." : "Зберегти з новою назвою"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </section>
  );
};

export default AddByLinkPage;
