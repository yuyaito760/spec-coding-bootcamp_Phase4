"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";

const CodeRunner = dynamic(
  () => import("./CodeRunner").then((m) => m.CodeRunner),
  { ssr: false, loading: () => <div className="mt-2 text-xs text-zinc-400">実行環境を読み込み中...</div> }
);

const EXECUTABLE_LANGUAGES = new Set(["tsx", "jsx", "ts", "js"]);

interface CodeBlockProps {
  children?: React.ReactNode;
}

export function CodeBlock({ children }: CodeBlockProps) {
  const [open, setOpen] = useState(false);

  const child = React.Children.toArray(children)[0] as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
  const className = child?.props?.className ?? "";
  const language = className.replace("language-", "");
  const isExecutable = EXECUTABLE_LANGUAGES.has(language);
  const code = String(child?.props?.children ?? "").replace(/\n$/, "");

  return (
    <div className="my-2">
      <div className="relative">
        {isExecutable && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="absolute top-2 right-2 rounded px-2 py-0.5 text-xs bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors"
          >
            {open ? "✕ 閉じる" : "▶ 実行"}
          </button>
        )}
        <pre className="rounded-lg bg-zinc-900 text-zinc-100 p-4 overflow-x-auto text-sm">
          <code>{code}</code>
        </pre>
      </div>
      {open && <CodeRunner code={code} language={language} />}
    </div>
  );
}
