import type { DynamicToolUIPart } from "ai";

const statusLabels: Record<string, string> = {
  context7ResolveLibrary: "ライブラリを検索中...",
  context7QueryDocs: "ドキュメントを取得中...",
  tavilySearch: "Web検索中...",
};

interface ToolStatusProps {
  toolParts: DynamicToolUIPart[];
}

export function ToolStatus({ toolParts }: ToolStatusProps) {
  const active = toolParts.filter(
    (p) => p.state === "input-streaming" || p.state === "input-available"
  );

  if (active.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 py-1">
      {active.map((p) => (
        <div key={p.toolCallId} className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent dark:border-zinc-500" />
          {statusLabels[p.toolName] ?? `${p.toolName} 実行中...`}
        </div>
      ))}
    </div>
  );
}
