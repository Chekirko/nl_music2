import { FormProps, Block } from "@/types";
import Link from "next/link";
import { SongBlock } from ".";
import AgreeModal from "./AgreeModal";
import { AVAILABLE_KEYS } from "@/constants";
import { TagInput } from "@/components/tags";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Form = ({
  type,
  song,
  setSong,
  submitting,
  handleSubmit,
  question,
  descr,
}: FormProps) => {
  const addBlock = () => {
    const maxInd = Math.max(...song.blocks.map((b) => Number(b.ind)), 0);
    const newBlock: Block = {
      name: "",
      version: "1",
      lines: "",
      ind: String(maxInd + 1),
    };
    setSong({ ...song, blocks: [...song.blocks, newBlock] });
  };

  const removeBlock = (index: number) => {
    if (song.blocks.length <= 1) return;
    const updatedBlocks = song.blocks.filter((_, i) => i !== index);
    setSong({ ...song, blocks: updatedBlocks });
  };

  const handleKeyChange = (value: string) => {
    setSong({ ...song, key: value });
  };

  return (
    <section className="w-full max-w-full flex-start flex-col">
      <h1 className="head_text text-left">
        <span className="blue_gradient">{type} пісню</span>
      </h1>
      <p className="desc text-left max-w-md">
        {type} та слова та акорди пісні, щоб всі були в курсі і ніхто не лажав
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="font-satoshi font-semibold text-base text-gray-700 block mb-2">
              Тональність
            </span>
            <Select value={song.key} onValueChange={handleKeyChange}>
              <SelectTrigger className="w-full bg-white h-10">
                <SelectValue placeholder="Оберіть тональність" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {AVAILABLE_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <span className="font-satoshi font-semibold text-base text-gray-700 block mb-2">
              Ритм
            </span>
            <input
              value={song?.rythm || ""}
              onChange={(e) => setSong({ ...song, rythm: e.target.value })}
              placeholder="Який ритм?"
              className="form_input"
            />
          </div>
        </div>

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
            Теги (Ключові слова для пошуку за темами)
          </span>
          <TagInput
            tags={song.tags}
            onChange={(tags) => setSong({ ...song, tags })}
            maxTags={5}
            placeholder="Введіть тег і натисніть Enter..."
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

        <div className="space-y-4">
          <h3 className="font-satoshi font-semibold text-lg text-gray-800">
            Блоки пісні
          </h3>
          
          {song.blocks.map((block, index) => (
            <SongBlock
              key={block.ind}
              block={block}
              index={index}
              song={song}
              setSong={setSong}
              onRemove={() => removeBlock(index)}
              canRemove={song.blocks.length > 1}
            />
          ))}

          <button
            type="button"
            onClick={addBlock}
            className="w-full py-3 border-2 border-dashed border-blue-400 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-500 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            Додати блок
          </button>
        </div>

        <div className="flex-end mx-3 mb-5 gap-4">
          <Link
            href="/"
            className="text-gray-500 hover:text-white text-sm font-medium hover:bg-blue-800 px-5 py-1.5 rounded-full"
          >
            Cancel
          </Link>

          <AgreeModal
            type={type}
            question={question}
            descr={descr}
            submitting={submitting}
            handleSubmit={handleSubmit}
          />
        </div>
      </form>
    </section>
  );
};

export default Form;
