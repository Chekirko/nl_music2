"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Block } from "@/types";
import { useState } from "react";
import SongBlockForEdit from "./SongBlockForEdit";

interface Props {
  index: number;
  handleUpdateBlock: (index: number, block: Block) => void;
  block: Block;
}

const EditSongBlockModal = ({ handleUpdateBlock, index, block }: Props) => {
  const [editBlock, setEditBlock] = useState<Block>(block);
  return (
    <AlertDialog>
      <AlertDialogTrigger
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        Змінити
      </AlertDialogTrigger>
      <AlertDialogContent
        onClick={(event) => {
          event.stopPropagation();
        }}
        className="bg-white max-sm:w-72"
      >
        <SongBlockForEdit
          block={editBlock}
          setBlock={setEditBlock}
        ></SongBlockForEdit>
        <AlertDialogFooter>
          <AlertDialogCancel>Скасувати</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              handleUpdateBlock(index, editBlock);
              console.log("Ok");
            }}
          >
            Змінити
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditSongBlockModal;
