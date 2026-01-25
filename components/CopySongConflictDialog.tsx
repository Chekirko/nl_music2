"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { SongCopyConflictPreview } from "@/types";

interface CopySongConflictDialogProps {
  open: boolean;
  preview: SongCopyConflictPreview | null;
  titleValue: string;
  isSubmitting: boolean;
  error?: string | null;
  onTitleChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const CopySongConflictDialog = ({
  open,
  preview,
  titleValue,
  isSubmitting,
  error,
  onTitleChange,
  onConfirm,
  onClose,
}: CopySongConflictDialogProps) => {
  if (!preview) return null;

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                  У вашій активній команді вже є пісня "{preview.title}"{preview.teamName ? ` (${preview.teamName})` : ""}. Якщо це інша пісня, введіть іншу назву для копії.
                </p>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700">Фрагмент існуючої пісні:</p>
                  <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4 max-h-64 overflow-y-auto">
                    {preview.blocks.length === 0 && (
                      <p className="text-sm text-gray-500">Блоки відсутні.</p>
                    )}
                    {preview.blocks.map((block, index) => (
                      <div key={`${block.name}-${index}`} className="mb-4 last:mb-0">
                        <p className="text-sm font-semibold text-blue-900">{block.name || `Блок ${index + 1}`}</p>
                        <pre className="whitespace-pre-wrap break-words text-xs text-gray-700">{block.lines}</pre>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="copy-new-title" className="block text-sm font-medium text-gray-700">
                    Нова назва пісні
                  </label>
                  <input
                    id="copy-new-title"
                    type="text"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={titleValue}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Наприклад: Назва (інша версія)"
                  />
                  {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Скасувати
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    onClick={onConfirm}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Збереження..." : "Зберегти з новою назвою"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CopySongConflictDialog;
