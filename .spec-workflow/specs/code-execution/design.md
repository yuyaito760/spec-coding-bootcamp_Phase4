# Design Document

## Overview

チャット回答内のReact/TypeScriptコードブロックに実行ボタンを追加し、クリックするとSandpackプレビューをその場で展開する機能です。`MessageItem.tsx` にMarkdownレンダリングを導入してコードブロックを検出し、独立した `CodeBlock.tsx` / `CodeRunner.tsx` コンポーネントで実行機能を提供します。Sandpackは遅延ロードして初期表示への影響を排除します。

## Steering Document Alignment

### Technical Standards (tech.md)
- `"use client"` ディレクティブはインタラクティブなコンポーネントのみに付与
- Tailwind CSS v4 でスタイリング
- 新規パッケージは `react-markdown`・`remark-gfm`・`@codesandbox/sandpack-react` の3つのみ追加

### Project Structure (structure.md)
- 新規コンポーネントは `src/components/chat/` 配下に追加（既存パターンと一致）
- `src/components/ui/` に汎用UIパーツとして切り出さず、チャット固有の機能として `chat/` 内に閉じる

## Code Reuse Analysis

### Existing Components to Leverage
- **`MessageItem.tsx`**: テキストパーツのレンダリング部分を `ReactMarkdown` に置き換え。ツールステータス表示部分は変更なし
- **既存Tailwindテーマ**: `dark:` バリアントを使ったダークモード対応を踏襲

### Integration Points
- **`MessageItem.tsx` → `CodeBlock.tsx`**: ReactMarkdownのカスタムレンダラーとして `CodeBlock` を渡す
- **`CodeBlock.tsx` → `CodeRunner.tsx`**: 実行ボタン押下時に `CodeRunner` を動的インポートで展開

## Architecture

```mermaid
graph TD
    MI[MessageItem.tsx] -->|textパーツをMarkdown変換| RM[ReactMarkdown]
    RM -->|codeブロック検出| CB[CodeBlock.tsx<br/>use client]
    CB -->|言語がtsx/jsx/ts/js| RUN[実行ボタン]
    RUN -->|クリック| CR[CodeRunner.tsx<br/>dynamic import]
    CR --> SP[Sandpack<br/>@codesandbox/sandpack-react]
    SP --> PV[ブラウザ内プレビュー]

    style CR fill:#e3f2fd
    style SP fill:#e8f5e9
```

### Modular Design Principles
- **`MessageItem.tsx`**: サーバーコンポーネントのまま維持。`ReactMarkdown` を使ってMarkdownをパース
- **`CodeBlock.tsx`**: `"use client"` — 実行ボタンのクリック状態（open/close）を管理
- **`CodeRunner.tsx`**: `"use client"` — Sandpackの遅延ロードラッパー。`CodeBlock` から動的インポート

## Components and Interfaces

### Component 1: `CodeBlock.tsx`
- **Purpose:** コードブロックを表示し、実行可能な言語の場合は実行ボタンを表示。パネルの開閉状態を管理
- **Interfaces:**
  ```tsx
  interface CodeBlockProps {
    className?: string  // ReactMarkdownが渡す言語情報 (例: "language-tsx")
    children: React.ReactNode
  }
  ```
- **Dependencies:** `CodeRunner.tsx`（動的インポート）、React `useState`
- **Reuses:** Tailwindの既存スタイルパターン

### Component 2: `CodeRunner.tsx`
- **Purpose:** Sandpackをラップして実行環境を提供するクライアントコンポーネント
- **Interfaces:**
  ```tsx
  interface CodeRunnerProps {
    code: string      // 実行するコード文字列
    language: string  // "tsx" | "jsx" | "ts" | "js"
  }
  ```
- **Dependencies:** `@codesandbox/sandpack-react`
- **Reuses:** なし（新規）

### Component 3: `MessageItem.tsx` の更新
- **Purpose:** テキストパーツのレンダリングを `<p>` タグから `ReactMarkdown` に変更
- **Interfaces:** 変更なし（既存の `MessageItemProps` を維持）
- **Dependencies:** `react-markdown`、`remark-gfm`、`CodeBlock.tsx`
- **Reuses:** 既存のツールステータス表示ロジック

## Data Models

### 実行可能言語の定義
```ts
const EXECUTABLE_LANGUAGES = new Set(["tsx", "jsx", "ts", "js"])

// ReactMarkdownが渡す className から言語を抽出
// 例: "language-tsx" → "tsx"
function extractLanguage(className?: string): string | undefined {
  return className?.replace("language-", "")
}
```

### Sandpackの設定
```ts
// CodeRunner.tsx 内
const sandpackTemplate = language === "tsx" || language === "jsx"
  ? "react-ts"  // React + TypeScript
  : "vanilla-ts"  // 純TypeScript / JavaScript
```

## Error Handling

### Error Scenarios

1. **Sandpackの動的インポート失敗**
   - **Handling:** `dynamic(() => import('./CodeRunner'), { ssr: false })` の `loading` と エラーバウンダリで「実行環境の読み込みに失敗しました」を表示
   - **User Impact:** Sandpackパネルの代わりにエラーメッセージが表示される。コードブロック自体は引き続き表示される

2. **コードの実行時エラー**
   - **Handling:** Sandpackのデフォルトエラー表示に委ねる（プレビューパネル内にエラーが表示される）
   - **User Impact:** Sandpackパネル内にエラーが表示される。他の機能に影響なし

3. **ReactMarkdownのパース失敗**
   - **Handling:** `react-markdown` はパース失敗時でも安全にフォールバックするため追加処理不要
   - **User Impact:** 影響なし

## Testing Strategy

### Unit Testing
- `CodeBlock.tsx`: 実行可能言語（tsx）で実行ボタンが表示されること、非対象言語（bash）で非表示なことを確認

### Integration Testing
- `MessageItem.tsx`: Markdownのコードブロックが正しくレンダリングされること（比較表を含む）

### End-to-End Testing
- Playwright (`e2e/chat.spec.ts`) にコード実行シナリオを追加
  - コードブロックを含む回答を受け取り、実行ボタンが表示されることを確認
  - 実行ボタンをクリックするとSandpackパネルが展開されることを確認
