# CI/CDパイプライン

## 概要
Pull Request作成時に自動でLint、型チェック、ビルドを実行する。

## 要件
- main ブランチへのPRで実行
- ESLint による静的解析
- TypeScript の型チェック
- Next.js のビルド

## ファイル構成
- .github/workflows/ci.yml: ワークフロー定義