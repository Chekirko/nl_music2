"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AuthLinks, NavDropdownMenu, NavLinks, ActiveTeamBadge, NotificationBell } from ".";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
  const session = useSession();
  const [menuIcon, setMenuIcon] = useState(false);
  const [pinned, setPinned] = useState<{ id: string; title: string } | null>(null);

  const handleSmallerScreensNavigation = () => {
    setMenuIcon(!menuIcon);
  };

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("pinnedEvent");
        setPinned(raw ? JSON.parse(raw) : null);
      } catch {
        setPinned(null);
      }
    };
    read();
    const onChange = () => read();
    window.addEventListener("storage", onChange);
    window.addEventListener("pinned-event-changed", onChange as any);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("pinned-event-changed", onChange as any);
    };
  }, []);

  return (
    <header className="w-full bg-gray-900">
      <nav className="max-w-[1440px] mx-auto flex justify-between items-center padding-x py-4">
        <Link href="/" className="flex justify-center items-center" onClick={handleSmallerScreensNavigation}>
          <Image src="/logoi.svg" alt="New Life logo" width={76} height={10} className="object-contain" />
          <span className="uppercase font-bold text-3xl text-blue-800">Nl_Songs</span>
        </Link>

        <div className="hidden lg:flex items-center gap-4">
          <NavLinks />
          <ActiveTeamBadge />
          <NotificationBell />
          {pinned && (
            <div className="flex items-center gap-2">
              <Link
                href={`/events/${pinned.id}`}
                className="max-sm:hidden rounded-full border-2 border-yellow-500 text-yellow-200 hover:text-white hover:bg-yellow-600/20 px-4 py-1.5 text-sm font-semibold"
                title="Відкріпити подію"
              >
                📌 {pinned.title}
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("pinnedEvent");
                  setPinned(null);
                  window.dispatchEvent(new CustomEvent("pinned-event-changed"));
                }}
                className="text-yellow-400 hover:text-white"
                aria-label="Відкріпити"
                title="Відкріпити"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {session?.data ? (
          <div className="hidden lg:flex gap-4 text-white font-bold">
            <Link href="/profile" className="px-4 py-1.5 border-2 border-blue-600 rounded-full" title="Мій профіль">
              Вітаємо, {session.data.user?.name}
            </Link>
            <button
              onClick={() => signOut()}
              className="px-4 py-1.5 border-2 border-blue-800  bg-blue-600 rounded-full hover:bg-blue-800"
            >
              Вийти
            </button>
          </div>
        ) : (
          <div className="hidden lg:block">
            <AuthLinks />
          </div>
        )}

        <div onClick={handleSmallerScreensNavigation} className="flex lg:hidden">
          {menuIcon ? (
            <AiOutlineClose size={48} className="text-blue-600" />
          ) : (
            <AiOutlineMenu size={48} className="text-blue-600" />
          )}
        </div>

        <div
          className={
            menuIcon
              ? "lg:hidden absolute top-[90px] bottom-0 left-0 flex justify-center items-center w-full h-screen bg-gray-900 text-white ease-in duration-300 text-center z-50"
              : "lg:hidden absolute top-[100px] right-0 left-[-100%] flex justify-center items-center w-full h-screen bg-slate text-white ease-in duration-300"
          }
        >
          <div className="w-full flex flex-col">
            {pinned && (
              <div className="self-center mb-6 flex items-center gap-2">
                <Link
                  href={`/events/${pinned.id}`}
                  onClick={handleSmallerScreensNavigation}
                  className="rounded-full border-2 border-yellow-500 text-yellow-200 hover:text-white hover:bg-yellow-600/20 px-4 py-1.5 text-base font-semibold"
                >
                  📌 {pinned.title}
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem("pinnedEvent");
                    setPinned(null);
                    window.dispatchEvent(new CustomEvent("pinned-event-changed"));
                  }}
                  className="text-yellow-400 hover:text-white"
                  aria-label="Відкріпити"
                >
                  ✕
                </button>
              </div>
            )}
            <NavLinks handleClick={handleSmallerScreensNavigation} />
            <div className="self-center mt-6">
              <ActiveTeamBadge />
            </div>
            <div className="self-center mt-4">
              <NotificationBell />
            </div>

            {session?.data ? (
              <div className="flex flex-col mt-16 lg:mt-0 justify-end items-center gap-6 text-white font-bold">
                <Link
                  href="/profile"
                  className="px-4 py-1.5 border-2 border-blue-600 rounded-full"
                  title="Мій профіль"
                  onClick={handleSmallerScreensNavigation}
                >
                  Вітаємо, {session.data.user?.name}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-1.5 border-2 border-blue-800  bg-blue-600 rounded-full hover:bg-blue-800"
                >
                  Вийти
                </button>
              </div>
            ) : (
              <div>
                <AuthLinks handleClick={handleSmallerScreensNavigation} />
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
