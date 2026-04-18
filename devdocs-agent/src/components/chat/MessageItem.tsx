import type { Message } from "ai";
import { ToolStatus } from "./ToolStatus";

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";

  const toolInvocations =
    !isUser && message.toolInvocations ? message.toolInvocations : [];

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        }`}
      >
        {toolInvocations.length > 0 && (
          <ToolStatus toolInvocations={toolInvocations} />
        )}
        {typeof message.content === "string" && message.content && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
}
