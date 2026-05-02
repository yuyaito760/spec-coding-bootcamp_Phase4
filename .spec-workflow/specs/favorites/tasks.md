# Tasks Document

- [x] 1. `useFavorites` フックを追加する
  - File: `devdocs-agent/src/hooks/useFavorites.ts`
  - LocalStorageキー `devdocs_favorites` でお気に入りを永続化
  - `favorites`, `addFavorite`, `removeFavorite` を返す
  - 重複追加の防止・初期化時のLocalStorage読み込みを実装
  - _Requirements: 1.2, 1.3, 1.4, 2.1, 2.2, 2.3_

- [x] 2. `FavoriteBar` コンポーネントを追加する
  - File: `devdocs-agent/src/components/chat/FavoriteBar.tsx`
  - favorites タグ表示（各タグに × 削除ボタン）
  - 「+ 追加」ボタンでインライン入力に切り替え、Enter/ボタンで確定
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. `ChatInterface` にお気に入り機能を統合する
  - File: `devdocs-agent/src/components/chat/ChatInterface.tsx`
  - `useFavorites` を呼び出す
  - `useChat` に `body: { favorites }` を追加
  - `FavoriteBar` を `MessageList` の上に配置
  - _Requirements: 1.1, 3.1_

- [x] 4. `route.ts` でお気に入りをシステムプロンプトに反映する
  - File: `devdocs-agent/src/app/api/chat/route.ts`
  - `favorites` をリクエストボディから取り出す
  - favorites非空時にsystemPromptへ優先参照指示を追記
  - _Requirements: 3.1, 3.2_
