import { SongBlockProps } from "@/types";
import { BLOCK_VERSIONS } from "@/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SongBlock = ({
  song,
  setSong,
  block,
  index,
  onRemove,
  canRemove = false,
}: SongBlockProps) => {
  const handleVersionChange = (value: string) => {
    const updatedBlocks = [...song.blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      version: value,
    };
    setSong({ ...song, blocks: updatedBlocks });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white/50 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="font-satoshi font-semibold text-base text-gray-700">
          Блок {index + 1}
        </span>
        {canRemove && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors self-start sm:self-center"
          >
            Видалити блок
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Назва частини
          </label>
          <input
            value={block.name}
            onChange={(e) => {
              const updatedBlocks = [...song.blocks];
              updatedBlocks[index] = {
                ...updatedBlocks[index],
                name: e.target.value,
              };
              setSong({ ...song, blocks: updatedBlocks });
            }}
            placeholder="Напр.: Куплет 1, Приспів"
            className="form_input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Тип блоку
          </label>
          <Select value={block.version} onValueChange={handleVersionChange}>
            <SelectTrigger className="w-full bg-white h-10">
              <SelectValue placeholder="Оберіть тип" />
            </SelectTrigger>
            <SelectContent>
              {BLOCK_VERSIONS.map((version) => (
                <SelectItem key={version} value={version}>
                  {version === "1" && "1 - Текст + акорди"}
                  {version === "2" && "2 - Тільки текст"}
                  {version === "3" && "3 - Тільки акорди"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Текст блоку
        </label>
        <textarea
          value={block.lines}
          onChange={(e) => {
            const updatedBlocks = [...song.blocks];
            updatedBlocks[index] = {
              ...updatedBlocks[index],
              lines: e.target.value,
            };
            setSong({ ...song, blocks: updatedBlocks });
          }}
          placeholder="Введіть текст пісні (акорди на окремих рядках)"
          className="form_textarea min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default SongBlock;
