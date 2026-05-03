"use client";

import type { UIMessage, DynamicToolUIPart } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToolStatus } from "./ToolStatus";
import { CodeBlock } from "./CodeBlock";

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
          <div key={i} className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: CodeBlock }}>
              {part.text}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  );
}
