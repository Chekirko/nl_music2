import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Block } from "@/types";
import { useState } from "react";
import SongBlockForEdit from "./SongBlockForEdit";
import { PencilSquareIcon } from "@heroicons/react/20/solid";

interface Props {
  index: number;
  handleUpdateBlock: (index: number, block: Block) => void;
  block: Block;
}

export function EditSongBlockDialog({
  handleUpdateBlock,
  index,
  block,
}: Props) {
  const [editBlock, setEditBlock] = useState<Block>(block);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <PencilSquareIcon className="w-6 h-6 text-gray-400 hover:text-blue-400" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-sm:w-[340px] bg-white px-1">
        <DialogHeader>
          <DialogTitle>Змінити блок</DialogTitle>
          <DialogDescription>
            Ти можеш поміняти текст або акорди для цього блока
          </DialogDescription>
        </DialogHeader>
        <SongBlockForEdit
          block={editBlock}
          setBlock={setEditBlock}
        ></SongBlockForEdit>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              handleUpdateBlock(index, editBlock);
            }}
          >
            Зберегти зміни
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
