import Link from "next/link";
import { NavDropdownMenu, AboutDropdownMenu } from ".";

interface NavLinksProps {
  handleClick?: () => void;
  hasActiveTeam?: boolean;
}

const NavLinks = ({ handleClick, hasActiveTeam }: NavLinksProps) => {
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

        {hasActiveTeam && (
          <li className="hover:border-b-2 hover:border-blue-800">
            <AboutDropdownMenu handleClick={handleClick} />
          </li>
        )}
      </ul>
    </div>
  );
};

export default NavLinks;
