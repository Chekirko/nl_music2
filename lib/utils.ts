import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FormUrlQueryParams {
  params: string;
  value: string | null;
  key: string;
}
export const formUrlQuery = ({ params, key, value }: FormUrlQueryParams) => {
  const currentUrl = qs.parse(params);

  if (key === "filter") {
    delete currentUrl.page;
  }

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
};
