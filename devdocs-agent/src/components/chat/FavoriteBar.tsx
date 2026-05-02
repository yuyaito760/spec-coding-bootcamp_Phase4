"use client";

import { useState } from "react";

interface FavoriteBarProps {
  favorites: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
}

export function FavoriteBar({ favorites, onAdd, onRemove }: FavoriteBarProps) {
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState("");

  const commit = () => {
    if (input.trim()) onAdd(input.trim());
    setInput("");
    setAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) commit();
    if (e.key === "Escape") { setInput(""); setAdding(false); }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-200 px-4 py-2 dark:border-zinc-700">
      <span className="shrink-0 text-xs text-zinc-400">お気に入り:</span>
      {favorites.map((lib) => (
        <span
          key={lib}
          className="flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-200"
        >
          {lib}
          <button
            onClick={() => onRemove(lib)}
            className="ml-0.5 leading-none text-blue-400 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-200"
            aria-label={`${lib}を削除`}
          >
            ×
          </button>
        </span>
      ))}
      {adding ? (
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder="ライブラリ名"
          className="w-28 shrink-0 rounded border border-blue-400 bg-white px-2 py-0.5 text-xs outline-none dark:bg-zinc-800 dark:text-zinc-100"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="shrink-0 rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-500 hover:border-blue-400 hover:text-blue-500 dark:border-zinc-600 dark:text-zinc-400"
        >
          + 追加
        </button>
      )}
    </div>
  );
}
