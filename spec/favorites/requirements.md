# Requirements Document

## Introduction

お気に入り機能は、よく使うライブラリをユーザーが登録し、AIエージェントが検索時にそれらを優先的に参照できるようにする機能です。LocalStorageに保存することでブラウザを閉じても設定が保持され、毎回ライブラリ名を入力する手間を省きます。

## Alignment with Product Vision

product.mdの「開発フローの中断を最小化し、コーディング生産性を向上させる」というビジネス目標を支援します。よく使うライブラリを登録しておくことで、AIが文脈を把握した上で回答を生成でき、より適切な情報を素早く得られます。

## Requirements

### Requirement 1: お気に入りライブラリの登録・削除

**User Story:** As a 開発者, I want よく使うライブラリをお気に入りに登録・削除できることを, so that 毎回ライブラリ名を指定しなくても適切な回答が得られる

#### Acceptance Criteria

1. WHEN チャット画面を開いた THEN 入力欄の上にお気に入りライブラリのバーが表示されるSHALL
2. WHEN バーの追加ボタンを押してライブラリ名を入力し確定した THEN そのライブラリがお気に入りに追加されSHALL
3. WHEN お気に入りタグの削除ボタン（×）を押した THEN そのライブラリがお気に入りから削除されSHALL
4. WHEN 同じライブラリ名を追加しようとした THEN 重複して追加されないSHALL

### Requirement 2: お気に入りの永続化

**User Story:** As a 開発者, I want ブラウザを閉じても登録したライブラリが保持されることを, so that 毎回設定し直す必要がない

#### Acceptance Criteria

1. WHEN ライブラリをお気に入りに追加した THEN LocalStorageに保存されSHALL
2. WHEN ブラウザをリロードした THEN 以前登録したお気に入りが復元されSHALL
3. WHEN ライブラリを削除した THEN LocalStorageからも削除されSHALL

### Requirement 3: 検索時の優先参照

**User Story:** As a 開発者, I want お気に入りに登録したライブラリが検索時に優先的に考慮されることを, so that 指定しなくても適切なライブラリの情報が得られる

#### Acceptance Criteria

1. WHEN お気に入りが1件以上登録された状態でメッセージを送信した THEN AIがお気に入りライブラリを優先的に参照するよう指示がシステムプロンプトに含まれるSHALL
2. WHEN お気に入りが0件の状態でメッセージを送信した THEN システムプロンプトへの追記は行われないSHALL

## Non-Functional Requirements

### Persistence
- LocalStorage のキー: `devdocs_favorites`
- 保存形式: JSON文字列化した `string[]`

### Performance
- LocalStorageの読み書きは同期的に行い、初期化時に1回だけ読み込む

### Usability
- お気に入りバーはコンパクトに表示し、ライブラリが0件の場合も追加ボタンのみ表示する
- タグはスクロール可能な横並びレイアウトとする
