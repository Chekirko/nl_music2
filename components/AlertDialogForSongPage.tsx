import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { TrashIcon, DocumentDuplicateIcon } from "@heroicons/react/20/solid";

interface Props {
  index: number;
  handleUpdateBlock: (index: number) => void;
  text: string;
  action: string;
  type: number;
}

const AlertDialogForSongPage = ({
  handleUpdateBlock,
  index,
  text,
  action,
  type,
}: Props) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {type === 2 ? (
          <TrashIcon className="w-6 h-6 text-gray-400 hover:text-blue-400" />
        ) : (
          <DocumentDuplicateIcon className="w-6 h-6 text-gray-400 hover:text-blue-400" />
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white max-sm:w-72">
        <AlertDialogHeader>
          <AlertDialogTitle>Ти впевнений?</AlertDialogTitle>
          <AlertDialogDescription className="font-medium">
            {text}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Відміна</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              handleUpdateBlock(index);
            }}
          >
            {action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDialogForSongPage;
