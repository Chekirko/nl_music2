"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface TeamOption {
  id: string;
  name: string;
}

interface Props {
  teams?: TeamOption[];
  otherClasses?: string;
  containerClasses?: string;
}

const TeamScopeFilter = ({ teams = [], otherClasses, containerClasses }: Props) => {
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

  // Get display name for current value
  const getDisplayValue = (value: string) => {
    if (value === "all") return "Всі пісні";
    if (value === "team") return "Моя команда";
    if (value === "others") return "Інші команди";
    if (value.startsWith("team:")) {
      const teamId = value.slice(5);
      const team = teams.find(t => t.id === teamId);
      return team?.name || "Команда";
    }
    return "Всі пісні";
  };

  return (
    <div className={`relative ${containerClasses}`}>
      <Select onValueChange={handleUpdateParams} value={paramScope}>
        <SelectTrigger
          className={`${otherClasses} body-regular light-border bg-blue-300 text-dark500_light700 border px-5 py-2.5 min-w-[180px]`}
        >
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue>{getDisplayValue(paramScope)}</SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="z-10 bg-blue-200 max-h-[300px] overflow-y-auto">
          {/* Primary options - always visible and highlighted */}
          <SelectGroup>
            <SelectItem 
              key="all" 
              value="all"
              className="bg-blue-100 font-semibold"
            >
              ★ Всі пісні
            </SelectItem>
            <SelectItem 
              key="team" 
              value="team"
              className="bg-blue-100 font-semibold"
            >
              ★ Моя команда
            </SelectItem>
            <SelectItem 
              key="others" 
              value="others"
              className="bg-blue-100 font-semibold"
            >
              ★ Інші команди
            </SelectItem>
          </SelectGroup>

          {/* Separator and individual teams */}
          {teams.length > 0 && (
            <>
              <SelectSeparator className="my-2 bg-blue-400" />
              <SelectGroup>
                <SelectLabel className="text-xs text-gray-600 px-2 py-1">
                  Окремі команди
                </SelectLabel>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={`team:${team.id}`}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TeamScopeFilter;
