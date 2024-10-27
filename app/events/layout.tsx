import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Служіння  |  Нова пісня",
  description: "Інформація про списки служінь, що проводяться в Новому житті",
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="max-w-[1600px] relative w-full bg-events-bg bg-cover bg-bottom h-72 flex justify-center items-center">
        <div className=" bg-black opacity-60 absolute inset-0"></div>
        <h1 className="uppercase text-white font-bold text-6xl text-center padding-x z-20">
          Окремі <span className=" text-yellow-400">служіння</span>
        </h1>
      </div>
      {children}
    </>
  );
}
