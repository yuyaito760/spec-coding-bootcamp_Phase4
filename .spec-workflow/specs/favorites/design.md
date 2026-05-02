# Design Document

## Overview

お気に入り機能は `useFavorites` カスタムフック（LocalStorage管理）と `FavoriteBar` UIコンポーネントの2ファイルを追加し、既存の `ChatInterface.tsx` と `route.ts` を最小限変更することで実現します。

## Architecture

```mermaid
graph TD
    LS[LocalStorage<br/>devdocs_favorites] <-->|read/write| UF[useFavorites hook]
    UF --> CI[ChatInterface]
    CI --> FB[FavoriteBar<br/>タグ表示・追加・削除UI]
    CI -->|body: favorites| UC[useChat]
    UC -->|POST /api/chat<br/>{ messages, favorites }| API[route.ts]
    API -->|systemPromptに優先ライブラリ追記| LLM[Gemini LLM]
```

## Components and Interfaces

### Component 1: `useFavorites` フック (`src/hooks/useFavorites.ts`)
- **Purpose:** LocalStorageへのお気に入り永続化と状態管理
- **Interface:**
  ```ts
  function useFavorites(): {
    favorites: string[];
    addFavorite: (name: string) => void;
    removeFavorite: (name: string) => void;
  }
  ```
- **Storage:** `localStorage.getItem/setItem("devdocs_favorites")`
- **Deduplication:** `addFavorite` は同名が存在する場合は何もしない

### Component 2: `FavoriteBar` コンポーネント (`src/components/chat/FavoriteBar.tsx`)
- **Purpose:** お気に入りライブラリの表示・追加・削除UI
- **Interface:**
  ```ts
  interface FavoriteBarProps {
    favorites: string[];
    onAdd: (name: string) => void;
    onRemove: (name: string) => void;
  }
  ```
- **UI構造:**
  - 横スクロール可能なタグリスト（各タグに × ボタン）
  - 「+ 追加」ボタン → インライン入力フィールドに切り替え → Enter/確定で追加

### Component 3: `ChatInterface` の変更 (`src/components/chat/ChatInterface.tsx`)
- `useFavorites` を呼び出し favorites を取得
- `useChat` に `body: { favorites }` を追加してリクエスト時に送信
- `FavoriteBar` を `MessageList` の上に挿入

### Component 4: `route.ts` の変更 (`src/app/api/chat/route.ts`)
- `const { messages, favorites = [] } = await req.json()`
- favoritesが1件以上ある場合はsystemPromptに優先参照指示を追記

## Data Flow

1. ユーザーが `FavoriteBar` でライブラリを追加 → `useFavorites` がLocalStorageに保存
2. ユーザーがメッセージを送信 → `useChat` が `{ messages, favorites }` をPOST
3. `route.ts` が `favorites` を読み取り、systemPromptに「優先参照ライブラリ」として追記
4. Gemini LLMが優先ライブラリを意識して回答を生成

## Integration Points

- **`useChat` の `body` オプション** (`ChatInterface.tsx`): favoritesを毎リクエストに含める
- **`req.json()` の分割代入** (`route.ts`): `favorites` フィールドを追加で取り出す
- **`systemPrompt` の動的拡張** (`route.ts`): favorites非空時のみ追記

## Error Handling

- LocalStorageが使えない環境: `try/catch` で失敗時は空配列を返す（チャット機能に影響しない）
- favoritesが未送信（undefined）: デフォルト値 `[]` で対応し、systemPromptは変更しない
