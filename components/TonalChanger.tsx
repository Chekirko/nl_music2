import { useState } from "react";
import { Tab } from "@headlessui/react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  progression: string[] | undefined;
  changeTonal: (interval: string, tonal: string) => void;
  submitting: boolean;
}

export default function TonalChanger({
  progression,
  changeTonal,
  submitting,
}: Props) {
  const createInterval = (ind: number) => {
    let interval;
    if (ind === 0) {
      interval = "m6";
    } else if (ind === 1) {
      interval = "M6";
    } else if (ind === 2) {
      interval = "m7";
    } else if (ind === 3) {
      interval = "M7";
    } else if (ind === 4) {
      interval = "P1";
    } else if (ind === 5) {
      interval = "m2";
    } else if (ind === 6) {
      interval = "M2";
    } else if (ind === 7) {
      interval = "m3";
    } else if (ind === 8) {
      interval = "M3";
    } else if (ind === 9) {
      interval = "P4";
    } else if (ind === 10) {
      interval = "A4";
    } else if (ind === 11) {
      interval = "P5";
    }
    return interval;
  };

  const handleClick = (ind: number, tonal: string) => {
    const interval = createInterval(ind);
    changeTonal(interval!, tonal);
  };

  return (
    <div className="w-fit p-2">
      {progression && (
        <Tab.Group defaultIndex={4} selectedIndex={4}>
          <Tab.List className="flex flex-wrap mb-4 space-x-1 rounded-xl p-1 w-fit">
            {progression.map((tonal, ind) => (
              <Tab
                disabled={submitting}
                onClick={() => handleClick(ind, tonal)}
                key={tonal}
                className={({ selected }) =>
                  classNames(
                    "rounded-lg p-2 my-4 text-lg font-bold leading-5 bg-blue-300 flex-shrink-0 ",
                    "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                    ind === 4
                      ? "bg-red-500 text-blue-700 shadow z-10"
                      : "text-blue-100 hover:bg-white/[0.12] hover:text-blue-700"
                  )
                }
              >
                {tonal}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      )}
    </div>
  );
}
