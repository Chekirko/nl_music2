"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AuthLinks, NavDropdownMenu, NavLinks } from ".";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";

const Navbar = () => {
  const [menuIcon, setMenuIcon] = useState(false);

  const handleSmallerScreensNavigation = () => {
    setMenuIcon(!menuIcon);
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

        <div className="hidden lg:block">
          <AuthLinks />
        </div>

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
            <AuthLinks />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
