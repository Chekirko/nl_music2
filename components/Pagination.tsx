"use client";

import { formUrlQuery } from "@/lib/utils";
import { Button } from "./ui/button";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  pageNumber: number;
  isNext: boolean;
  totalCount: number;
  pageSize?: number;
}

const Pagination = ({ pageNumber, isNext, totalCount, pageSize = 100 }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalCount / pageSize);
  
  const handleNavigation = (targetPage: number) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: targetPage.toString(),
    });
    router.push(newUrl, { scroll: false });
  };

  // Calculate range for current page
  const startItem = (pageNumber - 1) * pageSize + 1;
  const endItem = Math.min(pageNumber * pageSize, totalCount);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (pageNumber > 3) {
        pages.push("...");
      }
      
      // Show pages around current
      const start = Math.max(2, pageNumber - 1);
      const end = Math.min(totalPages - 1, pageNumber + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (pageNumber < totalPages - 2) {
        pages.push("...");
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      {/* Range display */}
      <p className="text-gray-600 text-sm">
        Показано пісні {startItem}-{endItem} з {totalCount}
      </p>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex w-full items-center justify-center gap-1 flex-wrap">
          {/* Prev button */}
          <Button
            disabled={pageNumber === 1}
            onClick={() => handleNavigation(pageNumber - 1)}
            className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
          >
            <p className="body-medium text-dark200_light800">Попередня</p>
          </Button>
          
          {/* Page numbers */}
          {getPageNumbers().map((page, index) => (
            typeof page === "number" ? (
              <Button
                key={index}
                onClick={() => handleNavigation(page)}
                className={`min-h-[36px] min-w-[40px] px-3 py-2 ${
                  page === pageNumber
                    ? "bg-primary-500 text-light-900 font-bold"
                    : "light-border-2 border bg-transparent hover:bg-blue-100"
                }`}
              >
                {page}
              </Button>
            ) : (
              <span key={index} className="px-2 text-gray-500">
                {page}
              </span>
            )
          ))}
          
          {/* Next button */}
          <Button
            disabled={!isNext}
            onClick={() => handleNavigation(pageNumber + 1)}
            className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
          >
            <p className="body-medium text-dark200_light800">Наступна</p>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
