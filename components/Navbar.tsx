"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AuthLinks, NavDropdownMenu, NavLinks } from ".";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
  const session = useSession();
  const [menuIcon, setMenuIcon] = useState(false);

  const handleSmallerScreensNavigation = () => {
    setMenuIcon(!menuIcon);
    console.log("click");
  };

  return (
    <header className="w-full bg-gray-900">
      <nav className="max-w-[1440px] mx-auto flex justify-between items-center padding-x py-4">
        <Link
          href="/"
          className="flex justify-center items-center"
          onClick={handleSmallerScreensNavigation}
        >
          <Image
            src="/logoi.svg"
            alt="New Life logo"
            width={76}
            height={10}
            className="object-contain"
          />
          <span className="uppercase font-bold text-3xl text-blue-800">
            Nl_Songs
          </span>
        </Link>

        <div className="hidden lg:block">
          <NavLinks />
        </div>

        {session?.data ? (
          <div className="hidden lg:flex gap-4 text-white font-bold">
            <div className="px-4 py-1.5 border-2 border-blue-600 rounded-full">
              Привіт, {session.data.user?.name}
            </div>
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

        <div
          onClick={handleSmallerScreensNavigation}
          className="flex lg:hidden"
        >
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
            <NavLinks handleClick={handleSmallerScreensNavigation} />
            {/* <AuthLinks handleClick={handleSmallerScreensNavigation} /> */}

            {session?.data ? (
              <div className="flex flex-col mt-16 lg:mt-0 justify-end items-center gap-6 text-white font-bold">
                <div className="px-4 py-1.5 border-2 border-blue-600 rounded-full">
                  Привіт, {session.data.user?.name}
                </div>
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
