# Project Structure

## リポジトリ構成

```
spec-coding-bootcamp_Phase4/
├── devdocs-agent/          # メインアプリケーション (Next.js)
├── spec/                   # 仕様書ドキュメント
├── .spec-workflow/         # spec-workflow管理ファイル
├── .github/workflows/      # CI/CDワークフロー
├── .mcp.json               # MCPサーバー設定
├── CLAUDE.md               # Claudeエージェント向けルール
└── README.md
```

## アプリケーション構成 (`devdocs-agent/`)

### 現在の構成

```
devdocs-agent/
├── src/
│   └── app/                        # Next.js App Router
│       ├── layout.tsx              # ルートレイアウト (フォント・HTML設定)
│       ├── page.tsx                # トップページ
│       ├── globals.css             # グローバルスタイル (Tailwind)
│       └── favicon.ico
├── public/                         # 静的アセット
├── next.config.ts                  # Next.js設定 (React Compiler有効)
├── tsconfig.json                   # TypeScript設定
├── eslint.config.mjs               # ESLint設定
├── postcss.config.mjs              # PostCSS設定 (Tailwind v4)
├── package.json
└── CLAUDE.md / AGENTS.md          # エージェント向けガイド
```

### 実装後の想定構成

```
devdocs-agent/
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx                # チャットUIのエントリーポイント
│       ├── globals.css
│       └── api/
│           └── chat/
│               └── route.ts       # Vercel AI SDK チャットAPIエンドポイント
├── src/
│   ├── app/                        # ページ・APIルート
│   ├── components/                 # UIコンポーネント
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx   # チャットUI全体
│   │   │   ├── MessageList.tsx     # メッセージ一覧
│   │   │   └── InputForm.tsx       # 入力フォーム
│   │   └── ui/                     # 汎用UIパーツ
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── tools.ts            # Vercel AI SDK ツール定義 (Context7, Tavily)
│   │   │   └── model.ts            # Gemini モデル設定
│   │   └── utils.ts                # ユーティリティ関数
│   └── types/                      # 共通型定義
├── evals/                          # AIエージェント評価スクリプト
│   ├── test-cases/                 # 評価用テストケース
│   └── run-evals.ts                # 評価実行スクリプト
└── tests/
    └── e2e/                        # Playwright E2Eテスト
        └── chat.spec.ts
```

## 主要ファイルの役割

| ファイル | 役割 |
|----------|------|
| `src/app/page.tsx` | チャットUIのメインページ |
| `src/app/api/chat/route.ts` | Vercel AI SDK のストリーミングAPIエンドポイント |
| `src/lib/ai/tools.ts` | Context7・Tavily検索のツール定義 |
| `src/lib/ai/model.ts` | Gemini 2.5 Flash Lite のモデル設定 |
| `next.config.ts` | React Compiler有効化などのNext.js設定 |
| `.mcp.json` | Context7・Tavilyなど MCP サーバーの接続設定 |

## コーディング規約

### ファイル・ディレクトリ命名
- コンポーネント: PascalCase (`ChatInterface.tsx`)
- ユーティリティ・lib: camelCase (`tools.ts`, `utils.ts`)
- APIルート: Next.js規約に従い `route.ts`
- テスト: `*.spec.ts` (Playwright)

### コンポーネント設計
- `src/app/` 配下: サーバーコンポーネントを基本とする
- インタラクティブなUI (`useChat` 等): `"use client"` ディレクティブを付与
- Vercel AI SDK の `useChat` フックはクライアントコンポーネントで使用

### 型定義
- `zod` を使用したAPIのスキーマバリデーション
- 共通型は `src/types/` にまとめる

### 環境変数
- `.env.local` で管理（リポジトリにコミットしない）
- 必須変数: `GOOGLE_GENERATIVE_AI_API_KEY`, `TAVILY_API_KEY`

## 重要な注意事項

- `devdocs-agent/AGENTS.md` に記載の通り、このNext.jsはトレーニングデータと異なるバージョン・APIを使用している可能性がある。コード実装前に必ず `node_modules/next/dist/docs/` のガイドを参照すること。
- Tailwind CSS v4 を使用（v3以前とは設定方法が異なる）
- React 19 + React Compiler が有効（`next.config.ts` で設定済み）
