import { Hero } from "@/components";
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

      <section className="mt-16 padding-x bg-gray-900 text-gray-400 flex justify-center ">
        <div className=" flex flex-col-reverse md:grid md:grid-cols-2 md:gap-20 w-3/4 py-32 max-w-[1440px] mx-auto">
          <div>
            <p className="mb-8">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti
              modi facilis explicabo minima aperiam! Voluptatem exercitationem
              fugit, soluta iste nostrum doloremque debitis temporibus obcaecati
              error nesciunt suscipit minus tempora maxime?
            </p>
            <p className="mb-8">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti
              modi facilis explicabo minima aperiam! Voluptatem exercitationem
              fugit, soluta iste nostrum doloremque debitis temporibus obcaecati
              error nesciunt suscipit minus tempora maxime?
            </p>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti
              modi facilis explicabo minima aperiam! Voluptatem exercitationem
              fugit, soluta iste nostrum doloremque debitis temporibus obcaecati
              error nesciunt suscipit minus tempora maxime?
            </p>
          </div>

          <h2 className="text-3xl font-semibold text-center mb-16 md:mb-0 lg:bg-guitar-bg lg:bg-no-repeat lg:bg-contain">
            Наше покликання
          </h2>
        </div>
      </section>
    </main>
  );
}
