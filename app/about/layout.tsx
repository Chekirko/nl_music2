import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Про нас  |  Нова пісня",
  description: "Інформація про учасників гурту прославлення церкви Нове життя",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="max-w-[1600px] mx-auto relative w-full bg-layout1-bg bg-cover bg-center h-72 flex justify-center items-center">
        <div className=" bg-black opacity-60 absolute inset-0"></div>
        <h1 className="uppercase text-white font-bold text-6xl text-center padding-x z-20">
          Наша <span className=" text-yellow-400">команда</span>
        </h1>
      </div>
      {children}
    </>
  );
}
