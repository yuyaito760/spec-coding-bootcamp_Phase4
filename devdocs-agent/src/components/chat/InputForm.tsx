import type { FormEvent, ChangeEvent, KeyboardEvent } from "react";

interface InputFormProps {
  input: string;
  isLoading: boolean;
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function InputForm({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: InputFormProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        const form = e.currentTarget.closest("form");
        form?.requestSubmit();
      }
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          placeholder="ライブラリについて質問してください..."
          rows={1}
          className="flex-1 resize-none rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "送信中..." : "送信"}
        </button>
      </div>
    </form>
  );
}
