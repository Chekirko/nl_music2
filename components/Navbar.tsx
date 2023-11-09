import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <header className="w-full bg-gray-900">
      <nav className="max-w-[1440px] mx-auto flex justify-between items-center padding-x py-4">
        <Link href="/" className="flex justify-center items-center">
          <Image
            src="/logoi.svg"
            alt="New Life logo"
            width={76}
            height={10}
            className="object-contain"
          />
        </Link>

        <div className="bg-blue-600 text-white hover:bg-white hover:text-blue-600 p-2 rounded">
          <Link href="/create-song" className="font-bold">
            Додати пісню
          </Link>
        </div>

        <div>
          <ul className="flex justify-end items-center gap-10 text-white">
            <li className="hover:text-blue-600">
              <Link href="/">Головна</Link>
            </li>
            <li className="hover:text-blue-600">
              <Link href="/songs">Пісні</Link>
            </li>
            <li className="hover:text-blue-600">
              <Link href="/about">Про нас</Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
