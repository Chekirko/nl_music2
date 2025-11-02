"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  otherClasses?: string;
  containerClasses?: string;
}

const TeamScopeFilter = ({ otherClasses, containerClasses }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramScope = searchParams.get("scope") || "all";

  const handleUpdateParams = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "scope",
      value,
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className={`relative ${containerClasses}`}>
      <Select onValueChange={handleUpdateParams} defaultValue={paramScope}>
        <SelectTrigger className={`${otherClasses} body-regular light-border bg-blue-300 text-dark500_light700 border px-5 py-2.5`}>
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue placeholder="Обрати джерело" />
          </div>
        </SelectTrigger>
        <SelectContent className="z-10 bg-blue-200" defaultValue={"all"}>
          <SelectGroup>
            <SelectItem key={"all"} value={"all"}>Всі пісні</SelectItem>
            <SelectItem key={"team"} value={"team"}>Моя команда</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TeamScopeFilter;

