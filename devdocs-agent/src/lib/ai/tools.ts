import { tool } from "ai";
import { z } from "zod";

export const context7ResolveLibrary = tool({
  description:
    "ライブラリ名からContext7のライブラリIDを解決する。ライブラリ・フレームワークに関する質問を受けたとき最初に呼ぶ。",
  parameters: z.object({
    libraryName: z.string().describe("検索するライブラリ名（例: next.js, react, tailwindcss）"),
  }),
  execute: async ({ libraryName }) => {
    try {
      const res = await fetch(
        `https://context7.com/api/v1/search?q=${encodeURIComponent(libraryName)}`
      );
      if (!res.ok) return `Context7検索エラー: ${res.status}`;
      const data = await res.json();
      return JSON.stringify(data);
    } catch (e) {
      return `Context7検索エラー: ${e instanceof Error ? e.message : String(e)}`;
    }
  },
});

export const context7QueryDocs = tool({
  description:
    "Context7のライブラリIDを使ってドキュメントを取得する。context7ResolveLibraryでIDを取得した後に呼ぶ。",
  parameters: z.object({
    libraryId: z.string().describe("Context7のライブラリID（例: /nextjs/nextjs）"),
    query: z.string().describe("検索クエリ（例: App Router authentication）"),
    tokens: z.number().optional().default(5000).describe("取得するトークン数"),
  }),
  execute: async ({ libraryId, query, tokens }) => {
    try {
      const id = libraryId.startsWith("/") ? libraryId : `/${libraryId}`;
      const url = `https://context7.com/api/v1${id}?query=${encodeURIComponent(query)}&tokens=${tokens}`;
      const res = await fetch(url);
      if (!res.ok) return `ドキュメント取得エラー: ${res.status}`;
      const text = await res.text();
      return text;
    } catch (e) {
      return `ドキュメント取得エラー: ${e instanceof Error ? e.message : String(e)}`;
    }
  },
});

export const tavilySearch = tool({
  description:
    "Web検索でライブラリの最新情報を検索する。Context7で情報が不足する場合のフォールバックとして使う。",
  parameters: z.object({
    query: z.string().describe("検索クエリ"),
  }),
  execute: async ({ query }) => {
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query,
          search_depth: "basic",
          max_results: 5,
        }),
      });
      if (!res.ok) return `Tavily検索エラー: ${res.status}`;
      const data = await res.json();
      return JSON.stringify(data);
    } catch (e) {
      return `Tavily検索エラー: ${e instanceof Error ? e.message : String(e)}`;
    }
  },
});
