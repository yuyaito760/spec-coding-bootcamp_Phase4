# Tasks Document

- [x] 1. パッケージを追加する
  - File: `devdocs-agent/package.json`
  - `react-markdown`・`remark-gfm`・`@codesandbox/sandpack-react` をインストール
  - _Leverage: `devdocs-agent/package.json` 既存の依存関係_
  - _Requirements: 2.1, 3.1_
  - _Prompt: Implement the task for spec code-execution, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer | Task: Install 3 packages in `devdocs-agent/`: run `npm install react-markdown remark-gfm @codesandbox/sandpack-react` and verify they appear in package.json dependencies. | Restrictions: Do not modify any source files in this task. Do not add type packages manually — they are bundled. | Success: All 3 packages appear in package.json dependencies, no install errors | Instructions: Mark task 1 as in-progress in tasks.md before starting, log implementation with log-implementation tool after completion, then mark as complete._

- [x] 2. `CodeRunner.tsx` を作成する
  - File: `devdocs-agent/src/components/chat/CodeRunner.tsx`
  - Sandpackをラップするクライアントコンポーネント
  - `{ code: string, language: string }` を受け取りSandpackを描画
  - language に応じて `template` を `"react-ts"` / `"vanilla-ts"` で切り替え
  - _Leverage: `@codesandbox/sandpack-react` の `Sandpack` コンポーネント_
  - _Requirements: 2.2, 2.3, 3.1, 3.2_
  - _Prompt: Implement the task for spec code-execution, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Developer specializing in component development | Task: Create `devdocs-agent/src/components/chat/CodeRunner.tsx` as a `"use client"` component. It accepts `{ code: string, language: string }` props. Use `Sandpack` from `@codesandbox/sandpack-react` with `theme="dark"`, `template` set to `"react-ts"` for tsx/jsx and `"vanilla-ts"` for ts/js, and `files` set to the main entry file with the provided code. Show both editor and preview panels. | Restrictions: Keep the component focused on Sandpack rendering only — no state management. Do not add extra UI chrome beyond what Sandpack provides. | _Leverage: `@codesandbox/sandpack-react` Sandpack component_ | Success: Component renders Sandpack with correct template, TypeScript compiles without errors | Instructions: Mark task 2 as in-progress in tasks.md before starting, log implementation with log-implementation tool after completion, then mark as complete._

- [x] 3. `CodeBlock.tsx` を作成する
  - File: `devdocs-agent/src/components/chat/CodeBlock.tsx`
  - ReactMarkdownのカスタムコードブロックレンダラー
  - `className` から言語を抽出し、実行可能言語（tsx/jsx/ts/js）なら実行ボタンを表示
  - ボタンクリックで `CodeRunner` を動的インポートして展開・折りたたみ
  - _Leverage: `devdocs-agent/src/components/chat/CodeRunner.tsx`（dynamic import）、React `useState`_
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.4, 3.3_
  - _Prompt: Implement the task for spec code-execution, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Developer specializing in interactive UI components | Task: Create `devdocs-agent/src/components/chat/CodeBlock.tsx` as a `"use client"` component. Props: `{ className?: string; children: React.ReactNode }` (ReactMarkdown's code component interface). Extract language from className (e.g. "language-tsx" → "tsx"). Define `EXECUTABLE_LANGUAGES = new Set(["tsx","jsx","ts","js"])`. If language is executable, show a small "▶ 実行" button in the top-right of the code block. Use `useState(false)` for open/close. On button click, toggle state. When open, render `CodeRunner` via `next/dynamic` with `{ ssr: false }`. Show the raw code in a `<pre><code>` block regardless of open state. Style with Tailwind to match the dark code block aesthetic. | Restrictions: Do not use any syntax highlighting library — plain `<pre><code>` is fine. Do not import CodeRunner statically. | _Leverage: `next/dynamic`, `CodeRunner.tsx`_ | Success: Run button appears for tsx/jsx/ts/js only, Sandpack panel toggles on click, TypeScript compiles | Instructions: Mark task 3 as in-progress in tasks.md before starting, log implementation with log-implementation tool after completion, then mark as complete._

- [x] 4. `MessageItem.tsx` を更新する
  - File: `devdocs-agent/src/components/chat/MessageItem.tsx`
  - テキストパーツのレンダリングを `ReactMarkdown` + `remark-gfm` に変更
  - `components.code` に `CodeBlock` を渡す
  - _Leverage: `devdocs-agent/src/components/chat/MessageItem.tsx`、`CodeBlock.tsx`、`react-markdown`、`remark-gfm`_
  - _Requirements: 1.1, 2.1_
  - _Prompt: Implement the task for spec code-execution, first run spec-workflow-guide to get the workflow guide then implement the task: Role: React Developer | Task: Update `devdocs-agent/src/components/chat/MessageItem.tsx`. Replace the `textParts.map(...)` rendering that uses `<p className="whitespace-pre-wrap ...">` with `ReactMarkdown` from `react-markdown`. Pass `remarkPlugins={[remarkGfm]}` and `components={{ code: CodeBlock }}`. Wrap the whole component in `"use client"` since ReactMarkdown requires it, OR keep it as-is and extract just the text rendering into a small client sub-component — choose whichever compiles cleanly. Keep the existing `toolParts` / `ToolStatus` rendering unchanged. | Restrictions: Do not change the outer div/layout structure. Do not modify ToolStatus. | _Leverage: existing MessageItem structure, `CodeBlock.tsx`_ | Success: Markdown tables and code blocks render correctly, run button appears on code blocks, TypeScript compiles | Instructions: Mark task 4 as in-progress in tasks.md before starting, log implementation with log-implementation tool after completion, then mark as complete._
