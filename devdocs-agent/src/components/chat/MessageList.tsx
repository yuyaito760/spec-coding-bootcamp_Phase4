"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: UIMessage[];
  status: string;
}

export function MessageList({ messages, status }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-400 dark:text-zinc-600">
        <p className="text-sm">質問を入力してください</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {status === "submitted" && (
        <div className="flex justify-start">
          <div className="flex items-center gap-1.5 rounded-2xl bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
