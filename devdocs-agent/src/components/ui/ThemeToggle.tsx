"use client";

import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  };

  if (!mounted) {
    return (
      <button
        className="rounded-full p-2 text-xl transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
        aria-label="テーマ切替"
      >
        ☀️
      </button>
    );
  }

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