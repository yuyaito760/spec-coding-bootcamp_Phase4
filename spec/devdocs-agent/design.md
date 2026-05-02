# 設計書: DevDocs Agent

## システム概要

Next.js 16 App Router + Vercel AI SDK v6 + Gemini 2.5 Flash Lite をベースにしたチャットアプリケーション。ユーザーのメッセージをAIルーターが解析し、Context7・Tavily・直接回答の中から最適な手段を選んでストリーミングで返答する。

---

## アーキテクチャ

```
[ブラウザ]
    │ POST /api/chat (メッセージ)
    ▼
[Next.js APIルート: /api/chat/route.ts]
    │ streamText (Vercel AI SDK v6)
    ▼
[Gemini 2.5 Flash Lite]
    │ ツール選択
    ├──► [Context7 MCP] → ライブラリドキュメント取得
    ├──► [Tavily REST API] → Web検索
    └──► 直接回答（ツールなし）
    │ ストリーミングレスポンス
    ▼
[ブラウザ: useChat フック]
    │ toolInvocations でツール状態を監視
    ▼
[チャットUI: リアルタイム表示]
```

---

## ファイル構成

```
devdocs-agent/src/
├── app/
│   ├── layout.tsx              # 更新: metadata・ダークモード初期化
│   ├── page.tsx                # 更新: ChatInterface を配置
│   ├── globals.css             # 更新: ダークモード用CSS変数追加
│   └── api/
│       └── chat/
│           └── route.ts        # 新規: ストリーミングAPIエンドポイント
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx   # 新規: チャットUI全体 ("use client")
│   │   ├── MessageList.tsx     # 新規: メッセージ一覧
│   │   ├── MessageItem.tsx     # 新規: 個別メッセージ（ユーザー/AI）
│   │   ├── InputForm.tsx       # 新規: テキスト入力・送信
│   │   └── ToolStatus.tsx      # 新規: ツール実行中のステータス表示
│   └── ui/
│       └── ThemeToggle.tsx     # 新規: ダークモード切り替えボタン
└── lib/
    └── ai/
        ├── tools.ts            # 新規: Context7・Tavilyツール定義
        └── model.ts            # 新規: Geminiモデル設定
```

---

## 各コンポーネントの詳細設計

### `src/app/api/chat/route.ts`

```typescript
// POST /api/chat
// リクエスト: { messages: CoreMessage[] }
// レスポンス: ストリーミングテキスト (Vercel AI SDK DataStream形式)

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: geminiModel,
    system: systemPrompt,
    messages,
    tools: { context7ResolveLibrary, context7QueryDocs, tavilySearch },
    maxSteps: 5, // ツール多段呼び出し対応
  });
  return result.toDataStreamResponse();
}
```

**システムプロンプト方針**:
- 「ライブラリ・フレームワークに関する質問はまずContext7で検索せよ」
- 「Context7で情報が不足する場合はTavilyで検索せよ」
- 「回答は簡潔かつ正確に」

---

### `src/lib/ai/tools.ts` - ツール定義

#### Context7ツール（2段階）

```typescript
// ツール1: ライブラリIDの解決
context7ResolveLibrary: tool({
  description: "ライブラリ名からContext7のIDを解決する",
  parameters: z.object({ libraryName: z.string() }),
  execute: async ({ libraryName }) => { /* HTTP or MCP呼び出し */ }
})

// ツール2: ドキュメント検索
context7QueryDocs: tool({
  description: "Context7でライブラリのドキュメントを検索する",
  parameters: z.object({ libraryId: z.string(), query: z.string(), tokens: z.number().optional() }),
  execute: async ({ libraryId, query, tokens }) => { /* HTTP呼び出し */ }
})
```

**Context7 APIエンドポイント**:
- `https://context7.com/api/v1/search?q={libraryName}` → ライブラリID取得
- `https://context7.com/api/v1/{libraryId}?query={query}&tokens={tokens}` → ドキュメント取得

#### Tavilyツール

```typescript
tavilySearch: tool({
  description: "Web検索でライブラリの最新情報を検索する",
  parameters: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    // TAVILY_API_KEY を使ってREST API呼び出し
    // POST https://api.tavily.com/search
  }
})
```

---

### `src/lib/ai/model.ts`

```typescript
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const geminiModel = google("gemini-2.5-flash-lite-preview-06-17");
```

---

### `src/components/chat/ChatInterface.tsx`

"use client" コンポーネント。Vercel AI SDK の `useChat` フックを使用。

**状態管理**:
- `useChat` が管理: `messages`, `input`, `handleSubmit`, `handleInputChange`, `isLoading`
- `isDark`: ダークモード状態（useState + localStorage）

**レンダリング構造**:
```
<div> (全画面レイアウト)
  <header>
    <ThemeToggle />
  </header>
  <MessageList messages={messages} />
  <InputForm
    input={input}
    isLoading={isLoading}
    onInputChange={handleInputChange}
    onSubmit={handleSubmit}
  />
</div>
```

---

### `src/components/chat/MessageList.tsx`

`messages` 配列をループして `MessageItem` を表示。AIメッセージに含まれる `toolInvocations` を `ToolStatus` に渡す。

---

### `src/components/chat/MessageItem.tsx`

- `role === "user"`: 右寄せ、青系背景
- `role === "assistant"`: 左寄せ、グレー背景
- `toolInvocations` が存在する場合、`ToolStatus` を表示

---

### `src/components/chat/ToolStatus.tsx`

`toolInvocations` の状態に応じて表示内容を変更:

| ツール名 | 状態 | 表示テキスト |
|----------|------|-------------|
| `context7ResolveLibrary` | `call` | 「ライブラリを検索中...」 |
| `context7QueryDocs` | `call` | 「ドキュメントを取得中...」 |
| `tavilySearch` | `call` | 「Web検索中...」 |
| いずれも | `result` | 表示しない（完了） |

---

### `src/components/chat/InputForm.tsx`

- `<textarea>` でテキスト入力
- Enterキーで送信（Shift+Enterで改行）
- `isLoading` 中は送信ボタンを無効化

---

### `src/components/ui/ThemeToggle.tsx`

- クリックで `<html>` タグの `dark` クラスをトグル
- `localStorage` に `theme` を保存・復元
- アイコン: 月（ダーク）/ 太陽（ライト）

---

## ダークモード実装方針

Tailwind CSS v4 の `dark:` バリアント + `class` ストラテジーを使用。

`globals.css` に手動ダークモード用CSS変数を追加:
```css
.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
}
```

`layout.tsx` でページ読み込み時にlocalStorageを参照してダークモードを初期化するインラインスクリプトを挿入（フラッシュ防止）。

---

## 環境変数

| 変数名 | 用途 | サーバー/クライアント |
|--------|------|----------------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API認証 | サーバーのみ |
| `TAVILY_API_KEY` | Tavily検索API認証 | サーバーのみ |

---

## データフロー詳細

1. ユーザーがInputFormに入力してEnter押下
2. `useChat` の `handleSubmit` が `/api/chat` にPOSTリクエスト送信
3. APIルートが `streamText` を呼び出し、Geminiがメッセージを解析
4. Geminiがツールを選択・実行（必要に応じて複数回）
5. ツール実行中: フロントエンドの `toolInvocations` が更新 → `ToolStatus` が「検索中...」を表示
6. Geminiが最終回答を生成してストリーミング送信
7. `useChat` がストリームを受信し、`messages` を更新 → リアルタイム表示

---

## 対応しない設計

- チャット履歴のDB永続化（セッション内のみ保持）
- ユーザー認証
- テスト（後から追加予定）
