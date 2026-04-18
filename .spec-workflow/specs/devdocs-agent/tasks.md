# タスク一覧: DevDocs Agent

## タスクリスト

- [x] 1. AIモデル設定
- [x] 2. ツール定義（Context7・Tavily）
- [x] 3. チャットAPIルート
- [x] 4. ダークモード基盤
- [x] 5. ThemeToggle コンポーネント
- [x] 6. ToolStatus コンポーネント
- [x] 7. MessageItem・MessageList コンポーネント
- [x] 8. InputForm コンポーネント
- [x] 9. ChatInterface コンポーネント
- [x] 10. page.tsx 更新

---

## タスク詳細

### タスク 1: AIモデル設定

**対象ファイル**: `devdocs-agent/src/lib/ai/model.ts`（新規）

**内容**: Gemini 2.5 Flash Lite のモデルインスタンスを生成してエクスポートする。

**要件参照**: 要件2（AIルーターによるツール選択）

---

_Prompt:

Implement the task for spec devdocs-agent, first run spec-workflow-guide to get the workflow guide then implement the task:

- Role: AIバックエンド開発者
- Task: `devdocs-agent/src/lib/ai/model.ts` を新規作成する。`@ai-sdk/google` の `createGoogleGenerativeAI` を使って Gemini 2.5 Flash Lite モデルのインスタンスを生成してエクスポートすること。モデルID は `gemini-2.5-flash-lite-preview-06-17`。APIキーは `process.env.GOOGLE_GENERATIVE_AI_API_KEY` から取得。
- Restrictions: クライアントサイドで使わないこと。APIキーをハードコードしないこと。
- _Leverage: `devdocs-agent/package.json` で `@ai-sdk/google` v3 がインストール済みであることを確認。
- _Requirements: 要件2（AIルーターによるツール選択）
- Success: `geminiModel` がエクスポートされており、他のファイルからインポートして使用できる。
- タスク開始時に tasks.md の `[ ]` を `[-]` に変更し、完了後に log-implementation ツールで実装内容を記録してから `[-]` を `[x]` に変更すること。

---

### タスク 2: ツール定義（Context7・Tavily）

**対象ファイル**: `devdocs-agent/src/lib/ai/tools.ts`（新規）

**内容**: Vercel AI SDK v6 の `tool()` を使い、Context7（2段階）とTavilyのツールを定義する。

**要件参照**: 要件2（AIルーターによるツール選択）

---

_Prompt:

Implement the task for spec devdocs-agent, first run spec-workflow-guide to get the workflow guide then implement the task:

- Role: AIツール統合開発者
- Task: `devdocs-agent/src/lib/ai/tools.ts` を新規作成する。以下の3つのツールを `tool()` で定義してエクスポートする。
  1. `context7ResolveLibrary`: `https://context7.com/api/v1/search?q={libraryName}` にGETリクエストしてライブラリIDを取得する
  2. `context7QueryDocs`: `https://context7.com/api/v1/{libraryId}?query={query}&tokens={tokens}` にGETリクエストしてドキュメントを取得する（tokensデフォルト5000）
  3. `tavilySearch`: `https://api.tavily.com/search` にPOSTリクエストしてWeb検索する（`TAVILY_API_KEY` 使用、`search_depth: "basic"`, `max_results: 5`）
  パラメータのバリデーションには `zod` を使用すること。
- Restrictions: APIキーをハードコードしないこと。サーバーサイド専用（`server-only` は不要だが `route.ts` からのみ使用）。エラー時はエラーメッセージ文字列を返すこと（例外スローしない）。
- _Leverage: `devdocs-agent/package.json` の `ai` v6・`zod` v4 がインストール済み。タスク1で作成した `model.ts` を参考に構造を合わせる。
- _Requirements: 要件2（AIルーターによるツール選択）
- Success: 3つのツールがエクスポートされており、`route.ts` からインポート可能。各ツールのパラメータスキーマが定義されている。
- タスク開始時に tasks.md の `[ ]` を `[-]` に変更し、完了後に log-implementation ツールで実装内容を記録してから `[-]` を `[x]` に変更すること。

---

### タスク 3: チャットAPIルート

**対象ファイル**: `devdocs-agent/src/app/api/chat/route.ts`（新規）

**内容**: `POST /api/chat` エンドポイント。`streamText` でGeminiを呼び出し、ツールを使って回答をストリーミングする。

**要件参照**: 要件2（AIルーターによるツール選択）、要件3（プログレス表示）

---

_Prompt:

Implement the task for spec devdocs-agent, first run spec-workflow-guide to get the workflow guide then implement the task:

- Role: Next.js バックエンド開発者
- Task: `devdocs-agent/src/app/api/chat/route.ts` を新規作成する。`POST` ハンドラを実装し、リクエストボディから `messages` を取得して `streamText` に渡す。`tools` にタスク2で定義した3つのツールを設定する。`maxSteps: 5` を指定してツールの多段呼び出しを許可する。システムプロンプトとして「ライブラリ・フレームワークに関する質問は必ずContext7で検索し、情報不足ならTavilyで補完せよ。日本語で簡潔に回答せよ」を設定する。`result.toDataStreamResponse()` を返す。
- Restrictions: APIキーはサーバーサイドのみで使用。`GOOGLE_GENERATIVE_AI_API_KEY` が未設定の場合は500エラーを返すこと。
- _Leverage: タスク1の `model.ts`・タスク2の `tools.ts` をインポートして使用する。Vercel AI SDK v6の `streamText` を `ai` パッケージからインポート。
- _Requirements: 要件2（AIルーターによるツール選択）、要件3（プログレス表示）
- Success: `POST /api/chat` にリクエストを送るとストリーミングレスポンスが返る。ツール呼び出しが発生した場合もデータストリームに含まれる。
- タスク開始時に tasks.md の `[ ]` を `[-]` に変更し、完了後に log-implementation ツールで実装内容を記録してから `[-]` を `[x]` に変更すること。

---

### タスク 4: ダークモード基盤

**対象ファイル**: `devdocs-agent/src/app/globals.css`（更新）、`devdocs-agent/src/app/layout.tsx`（更新）

**内容**: Tailwind v4 の `dark:` バリアントを有効化し、ページロード時のフラッシュを防ぐインラインスクリプトを追加する。

**要件参照**: 要件4（ダークモード対応）

---

_Prompt:

Implement the task for spec devdocs-agent, first run spec-workflow-guide to get the workflow guide then implement the task:

- Role: フロントエンド開発者（CSS・テーマ設計）
- Task: 以下の2ファイルを更新する。
  1. `globals.css`: `.dark { --background: #0a0a0a; --foreground: #ededed; }` を追加し、`<html>` に `dark` クラスが付いたときにダークテーマが適用されるようにする。Tailwind v4 は `@import "tailwindcss"` を使用済み。
  2. `layout.tsx`: `<html>` タグに `suppressHydrationWarning` を追加し、`<body>` 直前にlocalStorageを参照してダークモードを初期化するインラインスクリプト（`<script>` タグ、dangerouslySetInnerHTML）を挿入する。スクリプトの内容: `localStorage.getItem('theme') === 'dark'` または `prefers-color-scheme: dark` なら `<html>` に `dark` クラスを付与する。metadataのtitleは `DevDocs Agent` に変更する。
- Restrictions: インラインスクリプトはフラッシュ防止のために同期実行される必要があるので `defer` や `async` を付けないこと。
- _Leverage: 既存の `globals.css`・`layout.tsx` を読んでから変更する。
- _Requirements: 要件4（ダークモード対応）
- Success: ページロード時にlocalStorageの設定が反映され、フラッシュが発生しない。`.dark` クラスでダークテーマのCSS変数が適用される。
- タスク開始時に tasks.md の `[ ]` を `[-]` に変更し、完了後に log-implementation ツールで実装内容を記録してから `[-]` を `[x]` に変更すること。

---

### タスク 5: ThemeToggle コンポーネント

**対象ファイル**: `devdocs-agent/src/components/ui/ThemeToggle.tsx`（新規）

**内容**: ダークモード切り替えボタン。`<html>` の `dark` クラスをトグルしてlocalStorageに保存する。

**要件参照**: 要件4（ダークモード対応）

---

_Prompt:

Implement the task for spec devdocs-agent, first run spec-workflow-guide to get the workflow guide then implement the task:

- Role: フロントエンドUIコンポーネント開発者
- Task: `devdocs-agent/src/components/ui/ThemeToggle.tsx` を新規作成する。`"use client"` ディレクティブを付与。`useState` で現在のテーマを管理し、クリック時に `document.documentElement.classList.toggle('dark')` でトグルして `localStorage.setItem('theme', ...)` で保存する。初期値はlocalStorageまたは `prefers-color-scheme` から取得。ボタン内に月アイコン（ダーク時）または太陽アイコン（ライト時）をテキストまたはSVGで表示する。Tailwind v4 でスタイリング。
- Restrictions: 外部アイコンライブラリを使わないこと（SVGインラインまたはUnicode文字を使用）。`next/image` は不要。
- _Leverage: タスク4で設定したダークモード基盤（`globals.css` の `.dark` クラス）。
- _Requirements: 要件4（ダークモード対応）
- Success: ボタンクリックでライト/ダークが切り替わる。ページリロード後もテーマが維持される。
- タスク開始時に tasks.md の `[ ]` を `[-]` に変更し、完了後に log-implementation ツールで実装内容を記録してから `[-]` を `[x]` に変更すること。

---

### タスク 6: ToolStatus コンポーネント

**対象ファイル**: `devdocs-agent/src/components/chat/ToolStatus.tsx`（新規）

**内容**: ツール実行中のステータスを表示するコンポーネント。`toolInvocations` の状態に応じてメッセージを切り替える。

**要件参照**: 要件3（処理中のプログレス表示）

---

_Prompt:

Implement the task for spec devdocs-agent, first run spec-workflow-guide to get the workflow guide then implement the task:

- Role: フロントエンドUIコンポーネント開発者
- Task: `devdocs-agent/src/components/chat/ToolStatus.tsx` を新規作成する。propsとして Vercel AI SDK v6 の `ToolInvocation[]` を受け取る。各 `toolInvocation` の `state` が `"call"` または `"partial-call"` のとき、ツール名に応じて以下のテキストをスピナー付きで表示する:
  - `context7ResolveLibrary` → 「ライブラリを検索中...」
  - `context7QueryDocs` → 「ドキュメントを取得中...」
  - `tavilySearch` → 「Web検索中...」
  `state === "result"` のときは何も表示しない。スピナーはCSSアニメーション（`animate-spin`）で実装する。
- Restrictions: 外部ライブラリ不使用。AI SDK v6の型（`ToolInvocation`）を `ai` パッケージからインポートすること。
- _Leverage: Vercel AI SDK v6の型定義を参照する。
- _Requirements: 要件3（処理中のプログレス表示）
- Success: ツール実行中に対応するテキストとスピナーが表示され、完了後に消える。
- タスク開始時に tasks.md の `[ ]` を `[-]` に変更し、完了後に log-implementation ツールで実装内容を記録してから `[-]` を `[x]` に変更すること。

---

### タスク 7: MessageItem・MessageList コンポーネント

**対象ファイル**: `devdocs-agent/src/components/chat/MessageItem.tsx`（新規）、`devdocs-agent/src/components/chat/MessageList.tsx`（新規）

**内容**: メッセージ1件の表示コンポーネントと、一覧表示コンポーネント。

**要件参照**: 要件1（チャットで質問する）、要件3（プログレス表示）

---

_Prompt:

Implement the task for spec devdocs-agent, first run spec-workflow-guide to get the workflow guide then implement the task:

- Role: フロントエンドUIコンポーネント開発者
- Task: 以下の2ファイルを新規作成する。
  1. `MessageItem.tsx`: propsとして Vercel AI SDK v6 の `Message` 型を受け取る。`role === "user"` は右寄せ・青系背景、`role === "assistant"` は左寄せ・グレー背景でスタイリング。`toolInvocations` が存在する場合はタスク6の `ToolStatus` を表示する。メッセージテキストは `message.content`（文字列の場合）を表示する。
  2. `MessageList.tsx`: `Message[]` を受け取り、`MessageItem` をループレンダリングする。最新メッセージへの自動スクロール（`useEffect` + `scrollIntoView`）を実装する。
- Restrictions: `"use client"` を適切に付与すること（MessageListはuseEffectを使うのでクライアントコンポーネント）。
- _Leverage: タスク6の `ToolStatus` をインポートして使用する。AI SDK v6の `Message` 型を `ai` パッケージからインポート。
- _Requirements: 要件1（チャットで質問する）、要件3（プログレス表示）
- Success: ユーザーメッセージとAIメッセージが視覚的に区別できる。ツール実行ステータスが表示される。新しいメッセージが届くと自動スクロールする。
- タスク開始時に tasks.md の `[ ]` を `[-]` に変更し、完了後に log-implementation ツールで実装内容を記録してから `[-]` を `[x]` に変更すること。

---

### タスク 8: InputForm コンポーネント

**対象ファイル**: `devdocs-agent/src/components/chat/InputForm.tsx`（新規）

**内容**: テキスト入力と送信ボタン。Enterで送信、Shift+Enterで改行。ローディング中は無効化。

**要件参照**: 要件1（チャットで質問する）、要件3（プログレス表示）

---

_Prompt:

Implement the task for spec devdocs-agent, first run spec-workflow-guide to get the workflow guide then implement the task:

- Role: フロントエンドUIコンポーネント開発者
- Task: `devdocs-agent/src/components/chat/InputForm.tsx` を新規作成する。propsとして `input: string`・`isLoading: boolean`・`onInputChange: (e) => void`・`onSubmit: (e) => void` を受け取る。`<form>` + `<textarea>` + 送信ボタンで構成する。`onKeyDown` ハンドラでEnterキー（Shift無し）押下時に `onSubmit` を呼ぶ（デフォルト動作をpreventDefault）。`isLoading === true` のとき送信ボタンを `disabled` にして「送信中...」と表示する。Tailwind v4 でスタイリング（ダークモード対応の `dark:` バリアント付き）。
- Restrictions: `"use client"` は不要（props経由でイベントハンドラを受け取るだけ）。
- _Leverage: useChat フックの `handleInputChange`・`handleSubmit` と組み合わせる前提で設計。
- _Requirements: 要件1（チャットで質問する）、要件3（プログレス表示）
- Success: Enterキーで送信できる。ローディング中は送信ボタンが無効化される。ダークモードで適切に表示される。
- タスク開始時に tasks.md の `[ ]` を `[-]` に変更し、完了後に log-implementation ツールで実装内容を記録してから `[-]` を `[x]` に変更すること。

---

### タスク 9: ChatInterface コンポーネント

**対象ファイル**: `devdocs-agent/src/components/chat/ChatInterface.tsx`（新規）

**内容**: `useChat` フックを使うメインのチャットUIコンポーネント。全コンポーネントを統合する。

**要件参照**: 要件1〜4（全要件）

---

_Prompt:

Implement the task for spec devdocs-agent, first run spec-workflow-guide to get the workflow guide then implement the task:

- Role: フロントエンド統合開発者
- Task: `devdocs-agent/src/components/chat/ChatInterface.tsx` を新規作成する。`"use client"` ディレクティブ必須。Vercel AI SDK v6 の `useChat` フックを使用し、`api: "/api/chat"` を設定する。`messages`・`input`・`handleInputChange`・`handleSubmit`・`isLoading` を取得して各コンポーネントに渡す。レイアウト: ヘッダー（タイトル `DevDocs Agent` + `ThemeToggle`）、メインエリア（`MessageList`）、フッター（`InputForm`）の3段構成。全画面高さを使用（`h-screen` または `min-h-screen`）。ダークモード対応の背景色をTailwind v4で設定。
- Restrictions: APIルートのパスは `/api/chat` で固定。ツールの追加設定はAPIルート側で行うのでフロント側では不要。
- _Leverage: タスク4〜8で作成した全コンポーネント（`ThemeToggle`, `MessageList`, `InputForm`）をインポートして使用する。
- _Requirements: 要件1〜4（全要件）
- Success: チャット画面が表示され、メッセージの送受信・ツールステータス表示・ダークモード切り替えが動作する。
- タスク開始時に tasks.md の `[ ]` を `[-]` に変更し、完了後に log-implementation ツールで実装内容を記録してから `[-]` を `[x]` に変更すること。

---

### タスク 10: page.tsx 更新

**対象ファイル**: `devdocs-agent/src/app/page.tsx`（更新）

**内容**: デフォルトのNext.jsスターターを削除し、`ChatInterface` を配置する。

**要件参照**: 要件1（チャットで質問する）

---

_Prompt:

Implement the task for spec devdocs-agent, first run spec-workflow-guide to get the workflow guide then implement the task:

- Role: Next.js フロントエンド開発者
- Task: `devdocs-agent/src/app/page.tsx` を更新する。既存のデモコンテンツ（Next.jsロゴ・リンク等）を全て削除し、`ChatInterface` コンポーネントを配置するだけのシンプルなページにする。サーバーコンポーネントのまま（`"use client"` 不要）。
- Restrictions: `page.tsx` はサーバーコンポーネントとして維持する。`ChatInterface` 自体が `"use client"` なのでラップするだけでよい。
- _Leverage: タスク9で作成した `ChatInterface` をインポートして使用する。
- _Requirements: 要件1（チャットで質問する）
- Success: ブラウザでアクセスするとチャット画面が表示される。デバッグ用の `console.log` が削除されている。
- タスク開始時に tasks.md の `[ ]` を `[-]` に変更し、完了後に log-implementation ツールで実装内容を記録してから `[-]` を `[x]` に変更すること。
