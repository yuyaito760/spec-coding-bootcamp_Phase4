# Design Document

## Overview

ライブラリ比較機能は、既存のDevDocsエージェントに「複数ライブラリの並列ドキュメント取得」と「比較表形式での回答生成」を追加します。新規ツール `compareLibraries` を `tools.ts` に追加し、`route.ts` のsystemPromptとツール登録を更新することで実現します。UIコンポーネントの変更は不要です。

## Steering Document Alignment

### Technical Standards (tech.md)
- Vercel AI SDK の `tool()` / `streamText` パターンを踏襲し、新規ツールを追加
- 既存の Context7 API・Tavily API への接続方式をそのまま再利用
- `stopWhen: stepCountIs` の値を比較フローに対応できるよう調整

### Project Structure (structure.md)
- 新規ツール関数は `src/lib/ai/tools.ts` に追加（既存パターンと一致）
- systemPromptの更新は `src/app/api/chat/route.ts` 内に閉じる
- 新規ファイルの作成なし

## Code Reuse Analysis

### Existing Components to Leverage
- **`context7ResolveLibrary`** (`tools.ts`): ライブラリIDの解決ロジックをそのまま内部で再利用
- **`context7QueryDocs`** (`tools.ts`): ドキュメント取得ロジックをそのまま内部で再利用
- **`tavilySearch`** (`tools.ts`): Context7失敗時のフォールバックとして再利用

### Integration Points
- **`streamText` の `tools` オブジェクト** (`route.ts:28`): 新規ツール `compareLibraries` を追加登録
- **`systemPrompt`** (`route.ts:9`): 比較クエリ検出時の動作と回答フォーマットを追記

## Architecture

比較クエリを検出したLLMが `compareLibraries` ツールを呼び出すと、ツール内部で全ライブラリのresolve→queryDocsを `Promise.all` で並列実行します。取得した結果はLLMに返され、比較表形式の回答を生成します。

```mermaid
graph TD
    U[ユーザー入力<br/>「ReactとVueの違いは？」] --> LLM[LLM / Gemini]
    LLM -->|比較クエリ検出| CT[compareLibraries tool<br/>libraries: react, vue<br/>query: 違い・比較]
    CT --> PA[Promise.all]
    PA --> R1[resolveLibrary react<br/>→ queryDocs reactId]
    PA --> R2[resolveLibrary vue<br/>→ queryDocs vueId]
    R1 --> ST[構造化結果<br/>{ react: ..., vue: ... }]
    R2 --> ST
    ST --> LLM2[LLM / Gemini]
    LLM2 --> ANS[比較表形式の回答]

    style PA fill:#e3f2fd
    style ST fill:#e8f5e9
```

### Modular Design Principles
- **Single File Responsibility**: `compareLibraries` は `tools.ts` に追加し、route.tsへの変更はpromptとtools登録のみ
- **Component Isolation**: `compareLibraries` 内で `context7ResolveLibrary.execute` / `context7QueryDocs.execute` を直接呼び出して並列化し、重複実装を避ける
- **Service Layer Separation**: ドキュメント取得ロジックはtools.tsに、LLMへの指示はsystemPromptに分離

## Components and Interfaces

### Component 1: `compareLibraries` ツール (`tools.ts`)
- **Purpose:** 複数ライブラリのドキュメントを並列取得し、構造化された結果を返す
- **Interfaces:**
  ```ts
  input: {
    libraries: string[]  // 比較対象ライブラリ名の配列 (例: ["react", "vue"])
    query: string        // 比較観点 (例: "違い、比較、パフォーマンス")
    tokens?: number      // 各ライブラリの取得トークン数 (デフォルト: 3000)
  }
  output: string  // JSON文字列: { [libraryName]: { docs: string, source: "context7"|"tavily"|"error" } }
  ```
- **Dependencies:** Context7 API, Tavily API
- **Reuses:** `context7ResolveLibrary.execute`, `context7QueryDocs.execute`, `tavilySearch.execute` の内部ロジック

### Component 2: systemPrompt の比較指示 (`route.ts`)
- **Purpose:** LLMが比較クエリを検出して `compareLibraries` を使用し、比較表形式で回答するよう指示
- **Interfaces:** 文字列（systemPromptに追記）
- **Dependencies:** なし
- **Reuses:** 既存のsystemPromptに節を追記

## Data Models

### compareLibraries の出力形式
```ts
type CompareResult = {
  [libraryName: string]: {
    docs: string           // 取得したドキュメントテキスト or エラーメッセージ
    source: "context7" | "tavily" | "error"
  }
}
// 例:
// {
//   "react": { docs: "...", source: "context7" },
//   "vue":   { docs: "...", source: "context7" }
// }
```

### LLMへの渡し方
`compareLibraries` ツールの戻り値として上記JSONをシリアライズして返す。LLMはこの結果をもとに比較表を生成する。

## Error Handling

### Error Scenarios

1. **Context7のライブラリID解決失敗**
   - **Handling:** `tavilySearch` で `"{libraryName} documentation"` を検索してフォールバック
   - **User Impact:** 比較表は表示されるが、当該ライブラリの出典が "Web検索" と表記される

2. **Context7のドキュメント取得失敗（ID解決成功後）**
   - **Handling:** 同様に `tavilySearch` にフォールバック
   - **User Impact:** 上記と同じ

3. **両方の取得に失敗**
   - **Handling:** `source: "error"` でエラーメッセージを返し、LLMが「情報を取得できませんでした」と回答
   - **User Impact:** 該当ライブラリの列が「情報取得失敗」と表示される

4. **比較対象が1つしか識別できない場合**
   - **Handling:** `compareLibraries` を呼ばず、従来の逐次検索フローにフォールバック
   - **User Impact:** 通常の単一ライブラリ回答が返される

## Testing Strategy

### Unit Testing
- `compareLibraries` ツールの `execute` 関数を単体テスト（Context7成功・失敗・Tavilyフォールバックの各ケース）

### Integration Testing
- evals (`evals/run.ts`) に比較クエリのテストケースを追加
  - 例: 「ReactとVueの違いを教えて」→ 比較表が含まれているか評価

### End-to-End Testing
- Playwright (`e2e/chat.spec.ts`) に比較クエリのシナリオを追加
  - 比較質問を入力し、Markdown表（`|`）が含まれる回答が返ることを確認
