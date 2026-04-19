import type { UIMessage, DynamicToolUIPart } from "ai";
import { ToolStatus } from "./ToolStatus";

interface MessageItemProps {
  message: UIMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";

  const toolParts = !isUser
    ? (message.parts.filter((p) => p.type === "dynamic-tool") as DynamicToolUIPart[])
    : [];

  const textParts = message.parts.filter((p) => p.type === "text");

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        }`}
      >
        {toolParts.length > 0 && <ToolStatus toolParts={toolParts} />}
        {textParts.map((part, i) => (
          <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed">
            {part.text}
          </p>
        ))}
      </div>
    </div>
  );
}
