# Tasks Document

- [x] 1. `compareLibraries` ツールを `tools.ts` に追加する
  - File: `devdocs-agent/src/lib/ai/tools.ts`
  - `libraries: string[]` と `query: string` を受け取る新規ツールを追加
  - 内部で各ライブラリの `resolve → queryDocs` を `Promise.all` で並列実行
  - Context7失敗時は `tavilySearch` にフォールバック
  - 結果を `{ [libraryName]: { docs: string, source: string } }` のJSON文字列で返す
  - _Leverage: `devdocs-agent/src/lib/ai/tools.ts` 内の既存 `context7ResolveLibrary`, `context7QueryDocs`, `tavilySearch` の `execute` 関数_
  - _Requirements: 2.1, 2.2, 3.1_
  - _Prompt: Implement the task for spec library-comparison, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer specializing in Vercel AI SDK tool development | Task: Add a new `compareLibraries` tool to `devdocs-agent/src/lib/ai/tools.ts` that accepts `{ libraries: string[], query: string, tokens?: number }` and returns a JSON string of `{ [libraryName]: { docs: string, source: "context7" | "tavily" | "error" } }`. Internally use `Promise.all` to fetch all libraries in parallel: for each library, call the resolve endpoint (`https://context7.com/api/v1/search?q=...`), extract the first result's ID, then call the queryDocs endpoint. On any failure, fall back to Tavily search (`TAVILY_API_KEY` env var). Reference the existing tool patterns in the file. | Restrictions: Do not modify existing tools (`context7ResolveLibrary`, `context7QueryDocs`, `tavilySearch`). Do not add external packages. Inline the HTTP fetch calls (don't call `.execute()` on existing tools, as tool wrappers don't expose it that way — replicate the fetch logic). | _Leverage: existing fetch patterns in `context7ResolveLibrary` and `context7QueryDocs` in the same file_ | _Requirements: Requirement 2.1 (parallel fetch), 2.2 (Tavily fallback), 3.1 (structured output)_ | Success: Tool compiles without TypeScript errors, parallel fetching verified by logic, fallback path implemented, returns valid JSON string | Instructions: Mark task 1 as in-progress in tasks.md before starting, log implementation with log-implementation tool after completion, then mark as complete._

- [x] 2. `route.ts` の systemPrompt と tools 登録を更新する
  - File: `devdocs-agent/src/app/api/chat/route.ts`
  - `compareLibraries` ツールを `tools` オブジェクトに追加
  - systemPrompt に比較クエリ検出・比較表形式での回答指示を追記
  - `stopWhen: stepCountIs(5)` を `stepCountIs(10)` に引き上げ
  - _Leverage: `devdocs-agent/src/app/api/chat/route.ts` 既存のsystemPromptとtools登録パターン_
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 3.4_
  - _Prompt: Implement the task for spec library-comparison, first run spec-workflow-guide to get the workflow guide then implement the task: Role: AI Prompt Engineer with expertise in Vercel AI SDK | Task: Update `devdocs-agent/src/app/api/chat/route.ts` to (1) import and register `compareLibraries` in the `tools` object, (2) append a new section to `systemPrompt` instructing the LLM to detect comparison queries (「〜と〜の違い」「〜と〜を比較」「〜 vs 〜」) and call `compareLibraries`, then format the response as a Markdown table with columns for each library and rows for: 概要, 主要な用途, 学習コスト, パフォーマンス, エコシステム — followed by supplementary notes and source attribution per library, (3) change `stopWhen: stepCountIs(5)` to `stepCountIs(10)`. | Restrictions: Do not change the model, do not modify tool definitions, only add to systemPrompt (do not rewrite), keep existing tool-use rules intact. | _Leverage: existing systemPrompt structure and tools registration in `route.ts`_ | _Requirements: Requirement 1.1 (query detection), 1.3 (fallback to sequential), 3.1–3.4 (table format + attribution)_ | Success: TypeScript compiles, `compareLibraries` appears in tools map, systemPrompt contains comparison instructions, stepCountIs updated to 10 | Instructions: Mark task 2 as in-progress in tasks.md before starting, log implementation with log-implementation tool after completion, then mark as complete._

- [x] 3. evals のテストケースに比較クエリを追加する
  - File: `devdocs-agent/evals/test-cases.json`
  - 「ReactとVueの違いを教えて」などの比較クエリテストケースを追加
  - 評価基準: 比較表（`|`）が含まれていること、両ライブラリ名が回答に含まれること
  - _Leverage: `devdocs-agent/evals/test-cases.json` 既存テストケースのフォーマット_
  - _Requirements: 1.1, 3.1_
  - _Prompt: Implement the task for spec library-comparison, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer specializing in AI agent evaluation | Task: Open `devdocs-agent/evals/test-cases.json` and add 2 new test cases for the comparison feature. Each case should have a user query like「ReactとVueの違いを教えて」or「Next.jsとRemixを比較して」, and evaluation criteria that check: (a) the response contains a Markdown table (`|`), (b) both library names appear in the response. Follow the exact JSON schema of existing test cases. | Restrictions: Do not modify existing test cases. Match the exact field names and structure of the existing entries. | _Leverage: existing test-cases.json structure_ | _Requirements: Requirement 1.1 (comparison detection), 3.1 (table format)_ | Success: JSON is valid, 2 new comparison test cases added with appropriate queries and evaluation criteria | Instructions: Mark task 3 as in-progress in tasks.md before starting, log implementation with log-implementation tool after completion, then mark as complete._
