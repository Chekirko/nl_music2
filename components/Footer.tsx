import Link from "next/link";
import Image from "next/image";
import { footerLinks } from "@/constants";
import { FooterLinkSection } from "@/types";
import { format } from "date-fns";

const Footer = () => {
  return (
    <footer className="max-w-[1600px] mx-auto flex flex-col text-black-100 mt-5 border-t border-gray-100">
      <div className="flex max-md:flex-col flex-wrap justify-between gap-5 sm:px-16 px-6 py-10">
        <div className="flex  justify-beetween gap-6">
          <Image
            src="/logoi.svg"
            alt="logo"
            width={60}
            height={18}
            className="object-contain"
          />
          <p className="text-base text-gray-700">
            Нове життя © 2023 - {format(new Date(), "yyyy")}
            <br />
            Всі права захищено &copy;
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
