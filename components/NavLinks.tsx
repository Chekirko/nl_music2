import Link from "next/link";
import { NavDropdownMenu } from ".";
import { NavLinksProps } from "@/types";

const NavLinks = ({ handleClick }: NavLinksProps) => {
  return (
    <div>
      <ul className="flex flex-col lg:flex-row justify-end items-center gap-10 text-white text-4xl lg:text-base">
        <li className="hover:text-blue-600 hover:border-b-2 hover:border-blue-800">
          <Link href="/" onClick={handleClick}>
            Головна
          </Link>
        </li>

        <li className="hover:border-b-2 hover:border-blue-800">
          <NavDropdownMenu handleClick={handleClick} />
        </li>

        <li className="hover:text-blue-600 hover:border-b-2 hover:border-blue-800">
          <Link href="/about" onClick={handleClick}>
            Про нас
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default NavLinks;
