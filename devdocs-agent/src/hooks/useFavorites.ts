"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "devdocs_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      // LocalStorageが使えない環境では空配列のまま
    }
  }, []);

  const save = (next: string[]) => {
    setFavorites(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 保存失敗時はメモリ上の状態のみ更新
    }
  };

  const addFavorite = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || favorites.includes(trimmed)) return;
    save([...favorites, trimmed]);
  };

  const removeFavorite = (name: string) => {
    save(favorites.filter((f) => f !== name));
  };

  return { favorites, addFavorite, removeFavorite };
}
