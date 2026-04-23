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
    <div className="mb-2 flex flex-col gap-1.5">
      {active.map((p) => (
        <div key={p.toolCallId} className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent dark:border-blue-500" />
          {statusLabels[p.toolName] ?? `${p.toolName} 実行中...`}
        </div>
      ))}
    </div>
  );
}
