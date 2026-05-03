# Requirements Document

## Introduction

ライブラリ比較機能は、「ReactとVueの違いは？」のような複数ライブラリを比較する質問に対して、それぞれの公式ドキュメントを並列検索し、比較表形式で回答する機能です。開発者が技術選定の際に複数のライブラリを横断的に比較調査できるようにします。

## Alignment with Product Vision

本機能はproduct.mdに記載の「複数のライブラリを横断的に調査することがある」というユーザーペインポイントを直接解消します。また「ドキュメントサイトを複数タブで開いて調べるのが非効率」という課題に対して、一度のチャット入力で比較回答を得られる体験を提供します。

## Requirements

### Requirement 1: 比較クエリの検出

**User Story:** As a 開発者, I want 複数ライブラリを比較する質問をしたとき自動的に比較モードが起動することを, so that 特別な操作なしに横断的な比較情報を得られる

#### Acceptance Criteria

1. WHEN ユーザーが「AとBの違い」「AとBを比較して」「AvsB」などの比較表現を含む質問を送信した THEN システムは比較対象の2つ以上のライブラリを識別SHALL
2. WHEN 比較対象のライブラリが識別された THEN システムは各ライブラリに対して並列でContext7検索を実行SHALL
3. IF 比較質問ではなく単一ライブラリへの質問の場合 THEN システムは従来の逐次検索フローを使用SHALL

### Requirement 2: 並列ドキュメント取得

**User Story:** As a 開発者, I want 複数ライブラリのドキュメントが同時に取得されることを, so that 比較回答が素早く返ってくる

#### Acceptance Criteria

1. WHEN 比較対象が2つ以上のライブラリに確定した THEN システムは各ライブラリのContext7検索（resolve + queryDocs）を並列実行SHALL
2. WHEN いずれかのライブラリのContext7検索が失敗した THEN システムはTavily Web検索にフォールバックしてそのライブラリの情報を取得SHALL
3. WHEN 全ライブラリの情報が揃った THEN システムは取得した情報をLLMに渡して比較回答を生成SHALL

### Requirement 3: 比較表形式での回答

**User Story:** As a 開発者, I want 比較結果がMarkdownの比較表で整理されることを, so that 視覚的に差異を把握しやすい

#### Acceptance Criteria

1. WHEN 比較回答を生成する THEN システムはMarkdownの表形式（`| 項目 | ライブラリA | ライブラリB |`）で主要な違いを整理SHALL
2. WHEN 比較表を作成する THEN 表には「概要」「主要な用途」「学習コスト」「パフォーマンス」「エコシステム」などの観点を含めるSHALL
3. WHEN 表の後 THEN 各ライブラリの特徴についての補足説明を付記SHALL
4. WHEN 回答の末尾 THEN 情報ソース（Context7 / Web検索）を各ライブラリごとに明記SHALL

## Non-Functional Requirements

### Code Architecture and Modularity
- **Single Responsibility Principle**: 比較ロジックはsystemPromptの指示とツール定義の変更のみで実現し、既存の検索ツール（`context7ResolveLibrary`、`context7QueryDocs`）を再利用する
- **Modular Design**: 新規ツールを追加する場合は`tools.ts`に独立した関数として追加し、`route.ts`への影響を最小化する
- **Clear Interfaces**: LLMへの指示はsystemPromptに集約し、ツール実装とプロンプト設計を分離する

### Performance
- 比較対象ライブラリのドキュメント取得は並列実行し、逐次実行に比べてレスポンス時間を短縮する
- `stopWhen: stepCountIs` の上限を比較クエリに対応できる値（最低8ステップ）に調整する

### Security
- 既存のContext7 API・Tavily APIの認証方式を踏襲し、新規のAPIキーや外部通信を追加しない

### Reliability
- 片方のライブラリのドキュメント取得に失敗しても、取得できた側の情報を使って部分的な比較回答を返す

### Usability
- ユーザーは比較したい旨を自然な日本語で入力でき、特別なコマンド構文は不要
