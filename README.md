# spec-coding-bootcamp Phase4 — DevDocs Agent

ライブラリ・フレームワークのドキュメントを検索して回答する AI エージェント。

## プロジェクト概要

Context7 API と Tavily Web 検索を組み合わせ、最新ドキュメントに基づいた回答を生成する。以下の機能を実装している。

- **ドキュメント検索**: Context7 API でライブラリの公式ドキュメントを取得
- **ライブラリ比較**: 複数ライブラリを並列検索し、Markdown 比較表を生成
- **コード実行**: 回答内の React/TypeScript コードを Sandpack でブラウザ内実行
- **お気に入り登録**: よく使うライブラリを LocalStorage に保存し、優先検索

## セットアップ手順

### 1. API キーの取得

| キー | 取得先 |
|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `TAVILY_API_KEY` | [Tavily](https://tavily.com/) |

### 2. 環境変数の設定

`devdocs-agent/.env.local` を作成:

```
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key
TAVILY_API_KEY=your-tavily-api-key
```

### 3. 依存関係のインストール

```bash
cd devdocs-agent
npm install
```

## 実行方法

```bash
cd devdocs-agent
npm run dev
```

ブラウザで http://localhost:3000 を開く。

## テスト実行方法

### E2E テスト（Playwright）

```bash
cd devdocs-agent
npm run test:e2e
```

### Eval テスト

AI の回答品質を評価するテスト。事前に開発サーバーを起動しておく必要がある。

```bash
# ターミナル1: 開発サーバーを起動
cd devdocs-agent
npm run dev

# ターミナル2: eval を実行
cd devdocs-agent
npm run eval
```

## Spec-Workflow について

本プロジェクトは [spec-workflow](https://github.com/anthropics/spec-workflow) を使用して仕様管理を行っている。

### ディレクトリ構成

```
.spec-workflow/
├── steering/        # プロジェクト全体の方針（product.md / tech.md / structure.md）
└── specs/           # 機能ごとの仕様（requirements / design / tasks）

spec/                # 提出用仕様書（.spec-workflow/specs/ のコピー）
```

### 仕様一覧

| Spec | 概要 | ステータス |
|---|---|---|
| devdocs-agent | コアチャット UI・ドキュメント検索エージェント | ✅ completed |
| library-comparison | ライブラリ比較機能 | ✅ completed |
| code-execution | Sandpack によるコード実行機能 | ✅ completed |
| favorites | お気に入りライブラリ登録機能 | ✅ completed |
