"use client";

import { useState, KeyboardEvent, useEffect, useRef } from "react";
import TagBadge from "./TagBadge";
import { searchTags } from "@/lib/actions/tagActions";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
}

interface TagSuggestion {
  _id: string;
  name: string;
  songsCount: number;
}

/**
 * Компонент для введення тегів.
 * - Enter для додавання тегу
 * - Автопідказки з існуючих тегів
 * - Заміна пробілів на дефіс
 * - Валідація: довжина, унікальність, максимальна кількість
 */
const TagInput = ({
  tags,
  onChange,
  maxTags = 5,
  maxLength = 20,
  placeholder = "Введіть тег...",
  disabled = false,
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Нормалізація тегу: lowercase, trim, пробіли → дефіс
  const normalizeTag = (tag: string): string => {
    return tag
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Заміна пробілів на дефіс
      .replace(/-+/g, "-")  // Видалення подвійних дефісів
      .replace(/^-|-$/g, ""); // Видалення дефісів на початку/кінці
  };

  // Пошук підказок при введенні
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const results = await searchTags(inputValue.trim());
        // Фільтруємо теги, які вже додані
        const filtered = results.filter(
          (s) => !tags.includes(s.name)
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Error fetching tag suggestions:", err);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [inputValue, tags]);

  // Закриття підказок при кліку поза компонентом
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tagValue: string) => {
    const normalized = normalizeTag(tagValue);

    if (!normalized) {
      return;
    }

    // Валідація
    if (normalized.length > maxLength) {
      setError(`Тег має бути коротшим за ${maxLength} символів`);
      return;
    }

    if (tags.includes(normalized)) {
      setError("Цей тег вже додано");
      return;
    }

    if (tags.length >= maxTags) {
      setError(`Максимум ${maxTags} тегів`);
      return;
    }

    // Додаємо тег
    onChange([...tags, normalized]);
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      // Якщо є виділена підказка — вибираємо її
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        addTag(suggestions[selectedIndex].name);
        return;
      }
      
      addTag(inputValue);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (showSuggestions && selectedIndex < suggestions.length - 1) {
        setSelectedIndex(selectedIndex + 1);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (showSuggestions && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (error) {
      setError(null);
    }
  };

  const handleSuggestionClick = (suggestion: TagSuggestion) => {
    addTag(suggestion.name);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="form_input w-full"
        autoComplete="off"
      />

      {/* Підказки */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion._id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex justify-between items-center ${
                index === selectedIndex ? "bg-blue-100" : ""
              }`}
            >
              <span>{suggestion.name}</span>
              <span className="text-gray-400 text-xs">
                {suggestion.songsCount} пісень
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Список тегів */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2.5">
          {tags.map((tag) => (
            <TagBadge
              key={tag}
              name={tag}
              onRemove={() => handleRemove(tag)}
            />
          ))}
        </div>
      )}

      {/* Помилка валідації */}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {/* Підказка */}
      <p className="text-gray-500 text-sm mt-2">
        Додайте до {maxTags} тегів. Пробіли автоматично замінюються на дефіс.
      </p>
    </div>
  );
};

export default TagInput;
