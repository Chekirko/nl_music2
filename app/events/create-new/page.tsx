import { CreateEventPageComponent } from "@/components";

const CreateEventPage = () => {
  return (
    <section className="padding-x max-w-[1600px] mx-auto w-full flex-start flex-col">
      <h1 className="head_text text-left">
        <span className="blue_gradient">Створи новий список</span>
      </h1>
      <p className="desc text-left max-w-md">
        Вибери необхідні пісні в потрібному порядку
      </p>

      <CreateEventPageComponent />
    </section>
  );
};

export default CreateEventPage;
