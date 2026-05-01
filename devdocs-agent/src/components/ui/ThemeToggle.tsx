"use client";

import { useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  const toggle = () => {
    const next = !isDark;

    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");

    setIsDark(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "ダークモード中" : "ライトモード中"}
      className="rounded-full p-2 text-xl transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}