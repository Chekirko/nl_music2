import { Block } from "@/types";

interface Props {
  block: Block;
  setBlock: (block: Block) => void;
}

const SongBlockForEdit = ({ block, setBlock }: Props) => {
  return (
    <label>
      <textarea
        value={block.lines}
        onKeyDown={(event) => {
          event.stopPropagation();
        }}
        onChange={(e) => {
          const updatedBlock = { ...block, lines: e.target.value };
          setBlock(updatedBlock);
        }}
        placeholder="Частинка пісні"
        className="form_textarea border border-gray-500 rounded-lg"
      />
    </label>
  );
};

export default SongBlockForEdit;
