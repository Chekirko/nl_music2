"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerDemo({
  onDateChange,
  existedDate,
}: {
  onDateChange: (selectedDate: Date | undefined) => void;
  existedDate?: Date;
}) {
  const [date, setDate] = React.useState<Date | undefined>(
    existedDate ?? undefined
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    console.log(selectedDate);
    setDate(selectedDate);
    onDateChange(selectedDate); // Передача вибраної дати на зміну стейту батьківського компонента
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-600" />
          {date ? (
            format(date, "PPP")
          ) : (
            <span className="font-semibold text-lg text-gray-600">
              Вибери дату
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 ">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          className="bg-gray-400"
        />
      </PopoverContent>
    </Popover>
  );
}
