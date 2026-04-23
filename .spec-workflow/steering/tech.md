# Tech Stack

## Overview

DevDocsエージェントは、Next.js 14をベースにしたフルスタック構成で、Vercel AI SDKを通じてGemini 2.5 Flash Liteによるドキュメント検索・回答生成を行います。Context7 APIとTavily APIを組み合わせて高精度なドキュメント情報を提供します。

## Frontend

### フレームワーク
- **Next.js 14** (App Router)
  - サーバーコンポーネントとクライアントコンポーネントを使い分け
  - App Routerによるファイルベースルーティング
  - Server ActionsによるAPIレスポンス処理

### スタイリング
- **Tailwind CSS**
  - ユーティリティファーストのCSSフレームワーク
  - レスポンシブデザイン対応
  - `tailwind.config.ts` でプロジェクト固有のカスタマイズを管理

## AI / LLM

### AI SDK
- **Vercel AI SDK**
  - `ai` パッケージによるストリーミングレスポンス対応
  - `useChat` / `useCompletion` フックでフロントエンドとシームレスに統合
  - Tool calling によるContext7・Tavily検索の制御

### モデル
- **Gemini 2.5 Flash Lite**
  - 低レイテンシ・高コスパなドキュメント検索回答に最適
  - `@ai-sdk/google` パッケージで接続
  - 必要に応じてモデルを差し替え可能な抽象化設計

## ドキュメント検索

### Context7 API
- **用途**: ライブラリ・フレームワークの公式ドキュメント検索
- **統合方法**: MCP (Model Context Protocol) サーバー経由
  - `resolve-library-id`: ライブラリIDの解決
  - `query-docs`: ドキュメントの検索・取得
- **優先度**: 最初に試みる主要検索ソース

### Tavily API
- **用途**: Context7でカバーされない情報やWeb上の最新情報の補完検索
- **統合方法**: `@tavily/core` パッケージまたはREST API
- **優先度**: Context7で情報が得られない場合のフォールバック

## 検索フォールバック戦略

```
1. Context7検索 (公式ドキュメント)
   ↓ 情報不足の場合
2. Tavily Web検索 (最新Web情報)
   ↓ それでも不足の場合
3. LLMの知識による直接回答
```

## テスト

### E2Eテスト
- **Playwright**
  - ブラウザベースのE2Eテスト
  - チャットUIの操作フローをテスト
  - `playwright.config.ts` で設定管理

### AIエージェント評価 (Evals)
- **Evals フレームワーク**
  - ドキュメント正確性の定量評価
  - 成功指標（正確性80%以上）の継続的な測定
  - テストケース: 主要ライブラリのAPIリファレンス質問セット

## 環境変数

| 変数名 | 用途 |
|--------|------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API認証 |
| `TAVILY_API_KEY` | Tavily Web検索API認証 |

## パッケージ管理

- **パッケージマネージャー**: npm / pnpm
- **Node.js**: 18以上

## デプロイ

- **Vercel** (推奨)
  - Next.jsとの親和性が高い
  - Edge Functionsでの低レイテンシ実行
  - 環境変数の安全な管理
