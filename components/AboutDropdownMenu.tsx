"use client";

import { Menu, Transition } from "@headlessui/react";
import { Fragment, JSX, SVGProps, useEffect, useState, useCallback } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { NavLinksProps } from "@/types";
import { getActiveTeamAction } from "@/lib/actions/teamActions";
import { usePathname } from "next/navigation";

export default function AboutDropdownMenu({ handleClick }: NavLinksProps) {
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const pathname = usePathname();

  const loadActiveTeam = useCallback(async () => {
    const res = await getActiveTeamAction();
    if (res.success && res.team) {
      setActiveTeamId(res.team.id);
    } else {
      setActiveTeamId(null);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadActiveTeam();
  }, [loadActiveTeam]);

  // Reload when pathname changes (navigation)
  useEffect(() => {
    loadActiveTeam();
  }, [pathname, loadActiveTeam]);

  // Listen for active-team-changed event
  useEffect(() => {
    const handleTeamChanged = () => {
      loadActiveTeam();
    };
    window.addEventListener("active-team-changed", handleTeamChanged);
    window.addEventListener("focus", handleTeamChanged);
    return () => {
      window.removeEventListener("active-team-changed", handleTeamChanged);
      window.removeEventListener("focus", handleTeamChanged);
    };
  }, [loadActiveTeam]);

  return (
    <div className="top-16 z-30 w-full text-right">
      <Menu as="div" className="relative group inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md bg-transparent  group-hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
            Команди
            <ChevronDownIcon
              className="ml-2 -mr-1 h-5 w-5 text-violet-200 group-hover:text-blue-600"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute z-50 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href={activeTeamId ? `/teams/${activeTeamId}` : "/profile"}
                    onClick={handleClick}
                    className={`${
                      active ? "bg-blue-400 text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    {active ? (
                      <TeamActiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <TeamInactiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    )}
                    Моя команда
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/teams"
                    onClick={handleClick}
                    className={`${
                      active ? "bg-blue-400 text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    {active ? (
                      <TeamsActiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <TeamsInactiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    )}
                    Всі команди
                  </Link>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

function TeamInactiveIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 4C11.1 4 12 4.9 12 6C12 7.1 11.1 8 10 8C8.9 8 8 7.1 8 6C8 4.9 8.9 4 10 4Z"
        fill="#EDE9FE"
        stroke="#A78BFA"
        strokeWidth="2"
      />
      <path
        d="M10 10C7.8 10 6 11.8 6 14V16H14V14C14 11.8 12.2 10 10 10Z"
        fill="#EDE9FE"
        stroke="#A78BFA"
        strokeWidth="2"
      />
    </svg>
  );
}

function TeamActiveIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 4C11.1 4 12 4.9 12 6C12 7.1 11.1 8 10 8C8.9 8 8 7.1 8 6C8 4.9 8.9 4 10 4Z"
        fill="#8B5CF6"
        stroke="#C4B5FD"
        strokeWidth="2"
      />
      <path
        d="M10 10C7.8 10 6 11.8 6 14V16H14V14C14 11.8 12.2 10 10 10Z"
        fill="#8B5CF6"
        stroke="#C4B5FD"
        strokeWidth="2"
      />
    </svg>
  );
}

function TeamsInactiveIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 4C7.1 4 8 4.9 8 6C8 7.1 7.1 8 6 8C4.9 8 4 7.1 4 6C4 4.9 4.9 4 6 4Z"
        fill="#EDE9FE"
        stroke="#A78BFA"
        strokeWidth="1.5"
      />
      <path
        d="M14 4C15.1 4 16 4.9 16 6C16 7.1 15.1 8 14 8C12.9 8 12 7.1 12 6C12 4.9 12.9 4 14 4Z"
        fill="#EDE9FE"
        stroke="#A78BFA"
        strokeWidth="1.5"
      />
      <path
        d="M6 10C4.3 10 3 11.3 3 13V15H9V13C9 11.3 7.7 10 6 10Z"
        fill="#EDE9FE"
        stroke="#A78BFA"
        strokeWidth="1.5"
      />
      <path
        d="M14 10C12.3 10 11 11.3 11 13V15H17V13C17 11.3 15.7 10 14 10Z"
        fill="#EDE9FE"
        stroke="#A78BFA"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function TeamsActiveIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 4C7.1 4 8 4.9 8 6C8 7.1 7.1 8 6 8C4.9 8 4 7.1 4 6C4 4.9 4.9 4 6 4Z"
        fill="#8B5CF6"
        stroke="#C4B5FD"
        strokeWidth="1.5"
      />
      <path
        d="M14 4C15.1 4 16 4.9 16 6C16 7.1 15.1 8 14 8C12.9 8 12 7.1 12 6C12 4.9 12.9 4 14 4Z"
        fill="#8B5CF6"
        stroke="#C4B5FD"
        strokeWidth="1.5"
      />
      <path
        d="M6 10C4.3 10 3 11.3 3 13V15H9V13C9 11.3 7.7 10 6 10Z"
        fill="#8B5CF6"
        stroke="#C4B5FD"
        strokeWidth="1.5"
      />
      <path
        d="M14 10C12.3 10 11 11.3 11 13V15H17V13C17 11.3 15.7 10 14 10Z"
        fill="#8B5CF6"
        stroke="#C4B5FD"
        strokeWidth="1.5"
      />
    </svg>
  );
}
