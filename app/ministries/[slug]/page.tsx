import { ourMinistries } from "@/constants";
import Image from "next/image";
import Link from "next/link";

interface MinistryPageProps {
  params: {
    slug: string;
  };
}

const MinistryPage = ({ params }: MinistryPageProps) => {
  const info = ourMinistries.find((minisrty) => minisrty.url === params.slug);
  return (
    <>
      {info && (
        <div className="padding-x">
          <h2 className="mb-12 font-semibold text-blue-600 text-5xl">
            {info.title}
          </h2>
          <section>
            <p>{info.descr}</p>
            <p>{info.verse}</p>
            <p>{info.details}</p>
          </section>

          <section>
            <h3>Відповідальний за служіння:</h3>
            <p>{info.chief}</p>
            <Image
              src="/чуб.png"
              alt="Chief`s photo"
              width={30}
              height={30}
              className="object-contain"
            />
            <p>
              tel: <span>{info.phone}</span>
            </p>
            <div>
              <Link href="#">
                <Image
                  src="/icons/telegram.png"
                  alt="Social Icon"
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </Link>
            </div>
            <div>
              <Link href="#">
                <Image
                  src="/icons/viber.png"
                  alt="Social Icon"
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </Link>
            </div>
          </section>

          <section className="bg-gray-50 py-8">
            <h3 className="mb-4 text-4xl font-semibold text-center">
              Наша команда
            </h3>
            <h4 className="mb-10 text-base text-gray-500 font-medium text-center">
              Люди, що беруть активну участь в служінні
            </h4>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 px-8">
              {info?.team?.map((item) => (
                <div
                  key={item.name}
                  className="flex p-4 gap-4 items-center rounded-2xl shadow-xl bg-white"
                >
                  <Image
                    src={item.face}
                    alt="Volunteer Photo"
                    width={90}
                    height={90}
                    className="object-contain rounded-md "
                  />
                  <p className="text-base text-center font-bold opacity-70 flex-grow">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3>Галерея</h3>
          </section>
        </div>
      )}
    </>
  );
};

export default MinistryPage;
