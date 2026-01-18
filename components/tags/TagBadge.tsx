"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

interface TagBadgeProps {
  name: string;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

/**
 * Компонент для відображення одного тегу як badge.
 * Підтримує видалення (кнопка ×) та клік для навігації.
 */
const TagBadge = ({ name, onRemove, onClick, className = "" }: TagBadgeProps) => {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-3 py-1 text-sm bg-blue-600 text-white rounded-full transition-colors";
  const clickableStyles = onClick ? "cursor-pointer hover:bg-blue-700" : "";
  const removeStyles = onRemove ? "pr-2" : "";

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <span
      className={`${baseStyles} ${clickableStyles} ${removeStyles} ${className}`}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span>{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          className="p-0.5 rounded-full hover:bg-blue-800 transition-colors"
          aria-label={`Видалити тег ${name}`}
        >
          <XMarkIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
};

export default TagBadge;
