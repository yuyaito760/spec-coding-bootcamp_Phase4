"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "devdocs_favorites";
const FAVORITES_EVENT = "favorites-updated";

let cachedRaw: string | null = null;
let cachedFavorites: string[] = [];

function getSnapshot(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedFavorites;
    cachedRaw = raw;
    cachedFavorites = raw ? JSON.parse(raw) : [];
    return cachedFavorites;
  } catch {
    return cachedFavorites;
  }
}

const EMPTY: string[] = [];
const getServerSnapshot = (): string[] => EMPTY;

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(FAVORITES_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(FAVORITES_EVENT, callback);
  };
}

function save(next: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  } catch {
    // LocalStorageが使えない環境では無視
  }
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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
