"use client";

import { EditTonalModalProps } from "@/types";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import TonalChanger from "./TonalChanger";

export default function EditTonalModal({
  type,
  question,
  descr,
  submitting,
  changeTonal,
  progression,
  currentTonal,
}: EditTonalModalProps) {
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const submitAndClose = (e: React.FormEvent) => {
    e.preventDefault();
    // handleSubmit(e);
    closeModal();
  };

  return (
    <>
      <div className="inset-0 flex items-center justify-start max-sm:my-2">
        <button
          type="button"
          onClick={openModal}
          className="rounded-full  bg-blue-600 hover:bg-blue-800 px-5 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
        >
          {type}
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {question}
                  </Dialog.Title>
                  <div className="mt-2">
                    <TonalChanger
                      progression={progression}
                      changeTonal={changeTonal}
                      currentTonal={currentTonal!}
                      submitting={submitting}
                      type="save"
                    />
                  </div>

                  <div className="flex mt-4 gap-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={submitAndClose}
                    >
                      {submitting ? "Одну секунду..." : "Готово!"}
                    </button>
                    {/* <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Скасувати
                    </button> */}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
