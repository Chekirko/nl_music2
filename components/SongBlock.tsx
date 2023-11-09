import { SongBlockProps } from "@/types";

const SongBlock = ({ song, setSong, block, index }: SongBlockProps) => {
  return (
    <label>
      <span className="font-satoshi font-semibold text-base text-gray-700">
        Блок {index + 1}
      </span>
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
        placeholder="Назва частини пісні"
        className="form_input"
      />
      <input
        value={block.version}
        onChange={(e) => {
          const updatedBlocks = [...song.blocks];
          updatedBlocks[index] = {
            ...updatedBlocks[index],
            version: e.target.value,
          };
          setSong({ ...song, blocks: updatedBlocks });
        }}
        placeholder="Назва частини пісні"
        required
        className="form_input"
      />
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
        placeholder="Назва частини пісні"
        className="form_textarea"
      />
    </label>
  );
};

export default SongBlock;
