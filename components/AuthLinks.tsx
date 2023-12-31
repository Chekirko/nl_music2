import { NavLinksProps } from "@/types";
import Link from "next/link";

const AuthLinks = ({ handleClick }: NavLinksProps) => {
  return (
    <div>
      <ul className="flex flex-col lg:flex-row mt-16 lg:mt-0 justify-end items-center gap-6 text-white">
        <li className="px-4 py-1.5 border-2 border-blue-800  bg-blue-600 rounded-full hover:bg-blue-800">
          <Link href="/login-page" onClick={handleClick}>
            Login
          </Link>
        </li>

        <li className="px-4 py-1.5 border-2 border-blue-600 rounded-full hover:bg-blue-600">
          <Link href="/signup-page" onClick={handleClick}>
            Register
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AuthLinks;
