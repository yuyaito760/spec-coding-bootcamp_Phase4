# Requirements Document

## Introduction

コード実行機能は、AIエージェントの回答に含まれるReact/TypeScriptコードをブラウザ内で直接実行できる機能です。Sandpack（CodeSandbox）を統合し、ドキュメントから得たコード例を即座に動作確認できるようにします。開発者がコピー&ペーストせずにその場でコードを試せることで、学習効率と実装速度を向上させます。

## Alignment with Product Vision

product.mdの「ドキュメントサイトを複数タブで開いて調べるのが非効率」というペインポイントに対応し、さらにコードを別環境で試す手間も省きます。「開発フローの中断を最小化し、コーディング生産性を向上させる」というビジネス目標を直接支援します。

## Requirements

### Requirement 1: コードブロックの実行ボタン表示

**User Story:** As a 開発者, I want チャット回答内のコードブロックに実行ボタンが表示されることを, so that 特別な操作なしにコードを試せる

#### Acceptance Criteria

1. WHEN AIの回答にReactまたはTypeScriptのコードブロックが含まれる THEN そのコードブロックの右上に「実行」ボタンを表示SHALL
2. WHEN コードブロックの言語が `tsx`・`jsx`・`ts`・`js` の場合 THEN 実行ボタンを表示SHALL
3. WHEN コードブロックの言語がそれ以外（`bash`・`json`・`css` など）の場合 THEN 実行ボタンを表示しないSHALL

### Requirement 2: Sandpackによるブラウザ内実行

**User Story:** As a 開発者, I want 実行ボタンを押すとコードがブラウザ内でその場で動作することを, so that 外部サービスや環境構築なしにコードを確認できる

#### Acceptance Criteria

1. WHEN 「実行」ボタンをクリックした THEN コードブロックの下部にSandpackプレビューパネルが展開SHALL
2. WHEN Sandpackパネルが展開された THEN コードが自動的に実行されプレビューが表示SHALL
3. WHEN Sandpackパネル内でコードを編集した THEN リアルタイムでプレビューに反映SHALL
4. WHEN 「実行」ボタンを再度クリックした THEN Sandpackパネルを閉じるSHALL

### Requirement 3: 安全なサンドボックス実行

**User Story:** As a 開発者, I want コードがサンドボックス内で安全に実行されることを, so that 不正なコードがブラウザやシステムに影響しない

#### Acceptance Criteria

1. WHEN コードを実行する THEN Sandpackのiframe sandboxにより外部ネットワークアクセスを制限SHALL
2. WHEN コードが実行エラーを起こした THEN エラーメッセージをSandpackパネル内に表示しブラウザ全体には影響しないSHALL
3. WHEN ページをリロードした THEN Sandpackの状態はリセットSHALL

## Non-Functional Requirements

### Code Architecture and Modularity
- **Single Responsibility Principle**: Sandpackの表示ロジックは独立したコンポーネント（`CodeRunner.tsx`）に分離し、既存の`MessageItem.tsx`への変更を最小化する
- **Modular Design**: コードブロックの言語判定ロジックはユーティリティ関数として切り出す
- **Dependency Management**: `@codesandbox/sandpack-react` パッケージを追加するのみで、既存依存関係を変更しない

### Performance
- Sandpackコンポーネントは遅延ロード（dynamic import）し、チャット画面の初期ロードに影響を与えない
- 実行ボタンを押すまでSandpackのリソースをロードしない

### Security
- Sandpackのデフォルトiframe sandboxを使用し、追加の設定変更を行わない
- ユーザーが編集したコードはブラウザ内のみで実行し、サーバーに送信しない

### Reliability
- Sandpackの読み込みに失敗した場合、エラーメッセージを表示してチャット機能には影響を与えない

### Usability
- 実行ボタンはコードブロックの視覚的な邪魔にならないよう小さく配置する
- Sandpackパネルの高さはデフォルト400px、コード編集エリアとプレビューエリアを左右に分割して表示する
