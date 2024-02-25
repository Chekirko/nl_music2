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

interface Props {
  index: number;
  handleDeleteBlock: (index: number) => void;
}

const AlertDialogForSongPage = ({ handleDeleteBlock, index }: Props) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        Видалити
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white max-sm:w-72">
        <AlertDialogHeader>
          <AlertDialogTitle>Ти впевнений?</AlertDialogTitle>
          <AlertDialogDescription className="font-medium">
            Хочеш видалити цей блок? Ця дія незворотня!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Відміна</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              handleDeleteBlock(index);
              console.log("Ok");
            }}
          >
            Видалити
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDialogForSongPage;
