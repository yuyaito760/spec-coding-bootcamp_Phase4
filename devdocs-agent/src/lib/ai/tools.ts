import { jsonSchema, tool } from "ai";

export const context7ResolveLibrary = tool({
  description:
    "ライブラリ名からContext7のライブラリIDを解決する。ライブラリ・フレームワークに関する質問を受けたとき最初に呼ぶ。",
  inputSchema: jsonSchema<{ libraryName: string }>({
    type: "object",
    properties: {
      libraryName: { type: "string", description: "検索するライブラリ名（例: next.js, react, tailwindcss）" },
    },
    required: ["libraryName"],
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
  inputSchema: jsonSchema<{ libraryId: string; query: string; tokens?: number }>({
    type: "object",
    properties: {
      libraryId: { type: "string", description: "Context7のライブラリID（例: /nextjs/nextjs）" },
      query: { type: "string", description: "検索クエリ（例: App Router authentication）" },
      tokens: { type: "number", description: "取得するトークン数", default: 5000 },
    },
    required: ["libraryId", "query"],
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

export const compareLibraries = tool({
  description:
    "複数のライブラリ・フレームワークを比較する質問（「AとBの違い」「AとBを比較」「A vs B」）を受けたときに呼ぶ。各ライブラリのドキュメントを並列取得し、構造化された結果を返す。",
  inputSchema: jsonSchema<{ libraries: string[]; query: string; tokens?: number }>({
    type: "object",
    properties: {
      libraries: { type: "array", items: { type: "string" }, description: "比較するライブラリ名の配列（例: [\"react\", \"vue\"]）" },
      query: { type: "string", description: "比較の観点（例: 「違い、パフォーマンス、学習コスト」）" },
      tokens: { type: "number", description: "各ライブラリのドキュメント取得トークン数", default: 3000 },
    },
    required: ["libraries", "query"],
  }),
  execute: async ({ libraries, query, tokens = 3000 }) => {
    const fetchLibraryDocs = async (libraryName: string): Promise<{ docs: string; source: "context7" | "tavily" | "error" }> => {
      try {
        const searchRes = await fetch(
          `https://context7.com/api/v1/search?q=${encodeURIComponent(libraryName)}`
        );
        if (!searchRes.ok) throw new Error(`search ${searchRes.status}`);
        const searchData = await searchRes.json();
        const libraryId: string | undefined = searchData?.results?.[0]?.id ?? searchData?.[0]?.id;
        if (!libraryId) throw new Error("library ID not found");

        const id = libraryId.startsWith("/") ? libraryId : `/${libraryId}`;
        const docsRes = await fetch(
          `https://context7.com/api/v1${id}?query=${encodeURIComponent(query)}&tokens=${tokens}`
        );
        if (!docsRes.ok) throw new Error(`docs ${docsRes.status}`);
        const docs = await docsRes.text();
        return { docs, source: "context7" };
      } catch {
        try {
          const tavilyRes = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: process.env.TAVILY_API_KEY,
              query: `${libraryName} ${query}`,
              search_depth: "basic",
              max_results: 3,
            }),
          });
          if (!tavilyRes.ok) throw new Error(`tavily ${tavilyRes.status}`);
          const tavilyData = await tavilyRes.json();
          return { docs: JSON.stringify(tavilyData), source: "tavily" };
        } catch (e) {
          return { docs: `情報取得失敗: ${e instanceof Error ? e.message : String(e)}`, source: "error" };
        }
      }
    };

    const results = await Promise.all(libraries.map(async (lib) => [lib, await fetchLibraryDocs(lib)] as const));
    return JSON.stringify(Object.fromEntries(results));
  },
});

export const tavilySearch = tool({
  description:
    "Web検索でライブラリの最新情報を検索する。Context7で情報が不足する場合のフォールバックとして使う。",
  inputSchema: jsonSchema<{ query: string }>({
    type: "object",
    properties: {
      query: { type: "string", description: "検索クエリ" },
    },
    required: ["query"],
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
