import Image from "next/image";

const Hero = () => {
  return (
    // <div className="max-w-[1440px] relative w-full bg-hero-bg bg-cover bg-center  h-screen flex justify-center items-center">
    //   <div className="bg-black opacity-60 absolute inset-0"></div>
    //   <h1 className="text-white uppercase font-extrabold text-6xl text-center padding-x z-20">
    //     Церква <span className="text-yellow-400">"Нове життя" </span>
    //     вітає тебе!
    //   </h1>
    // </div>

    <div className="hero">
      <div className="flex-1 pt-20 md:pt-28 xl:pt-36 padding-x">
        <h1 className="hero__title">Знаходь, співай, грай!</h1>

        <p className="hero__subtitle">
          Прославляй Бога улюбленими піснями так, як це робить твоя церква!
        </p>
      </div>

      <div className="hero__image-container">
        <div className="hero__image">
          <Image src="/pngegg1.png" alt="" fill className="object-contain" />
        </div>

        <div className="hero__image-overlay"></div>
      </div>
    </div>
  );
};

export default Hero;
