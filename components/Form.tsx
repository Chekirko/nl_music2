import { FormProps } from "@/types";
import Link from "next/link";
import { SongBlock } from ".";

const Form = ({ type, song, setSong, submitting, handleSubmit }: FormProps) => {
  return (
    <section className="w-full max-w-full flex-start flex-col">
      <h1 className="head_text text-left">
        <span className="blue_gradient">{type} пісню</span>
      </h1>
      <p className="desc text-left max-w-md">
        {type} та поділись зі всім світом цитатою, яка тобі сподобалась і нехай
        це посприяє духовному розвитку кожного читача
      </p>

      <form
        className="mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism"
        onSubmit={handleSubmit}
      >
        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Назва пісні
          </span>
          <input
            value={song.title}
            onChange={(e) => setSong({ ...song, title: e.target.value })}
            placeholder="Як ми називаємось?"
            required
            className="form_input"
          />
        </label>

        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Коментар
          </span>
          <input
            value={song.comment}
            onChange={(e) => setSong({ ...song, comment: e.target.value })}
            placeholder="Напиши коментар"
            className="form_input"
          />
        </label>

        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Тональність
          </span>
          <input
            value={song.key}
            onChange={(e) => setSong({ ...song, key: e.target.value })}
            placeholder="Як грати?"
            required
            className="form_input"
          />
        </label>

        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Модуляція
          </span>
          <input
            value={song.mode}
            onChange={(e) => setSong({ ...song, mode: e.target.value })}
            placeholder="Робимо модуляцію?"
            className="form_input"
          />
        </label>

        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Оригінал пісні
          </span>
          <input
            value={song.origin}
            onChange={(e) => setSong({ ...song, origin: e.target.value })}
            placeholder="Посилання на оригінал"
            className="form_input"
          />
        </label>

        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Оригінальне відео
          </span>
          <input
            value={song.video}
            onChange={(e) => setSong({ ...song, video: e.target.value })}
            placeholder="Посилання на відео"
            className="form_input"
          />
        </label>

        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Наше відео
          </span>
          <input
            value={song.ourVideo}
            onChange={(e) => setSong({ ...song, ourVideo: e.target.value })}
            placeholder="Посилання на наше відео"
            className="form_input"
          />
        </label>

        {song.blocks.map((block, index) => (
          <SongBlock
            key={block.ind}
            block={block}
            index={index}
            song={song}
            setSong={setSong}
          />
        ))}

        <div className="flex-end mx-3 mb-5 gap-4">
          <Link href="/" className="text-gray-500 text-sm">
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-1.5 text-sm bg-orange-400 rounded-full text-white"
          >
            {submitting ? `${type}...` : type}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Form;
