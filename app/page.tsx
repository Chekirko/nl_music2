import { Hero, UserGuide } from "@/components";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <div className="padding-x mt-16 max-w-[1440px] mx-auto">
        <Link
          href={"/songs"}
          className="py-3 px-8 w-full bg-primary font-bold text-lg hover:bg-primary-dark text-white rounded-full"
        >
          Шукай пісню
        </Link>
      </div>

      <UserGuide />
    </main>
  );
}
