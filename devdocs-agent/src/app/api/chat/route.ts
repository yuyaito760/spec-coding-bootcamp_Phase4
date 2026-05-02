import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { geminiModel } from "@/lib/ai/model";
import {
  context7ResolveLibrary,
  context7QueryDocs,
  tavilySearch,
  compareLibraries,
} from "@/lib/ai/tools";

const systemPrompt = `あなたはライブラリ・フレームワークのドキュメントを検索して回答するAIエージェントです。

## ツール使用ルール
1. ライブラリ・フレームワークに関する質問は、まず context7ResolveLibrary でライブラリIDを取得し、次に context7QueryDocs でドキュメントを検索すること。
2. Context7で十分な情報が得られない場合は tavilySearch でWeb検索すること。
3. いずれのツールでも情報が得られない場合のみ、知識から直接回答すること。

## 比較クエリのルール
- 「AとBの違い」「AとBを比較して」「A vs B」などの複数ライブラリ比較の質問を受けたとき、必ず compareLibraries ツールを呼ぶこと。
- compareLibraries の結果をもとに、以下のMarkdown比較表を作成すること：
  - 表の列: 各ライブラリ名
  - 表の行: 概要、主要な用途、学習コスト、パフォーマンス、エコシステム
- 比較表の後に各ライブラリの補足説明を付記すること。
- 回答末尾に各ライブラリの情報ソース（Context7 / Web検索）を明記すること。
- 比較対象が1つしか特定できない場合は、通常の単一ライブラリ検索フローを使用すること。

## 回答ルール
- 日本語で簡潔かつ正確に回答すること。
- 実装方法・使い方を聞かれたときは、APIメソッド名や具体的なコード例を必ず含めること。
- コード例は必ず1ファイルに収めること。別ファイルへのimportは書かず、必要なコンポーネントや関数はすべて同じファイル内に定義すること。
- 情報ソース（Context7 / Web検索 / 直接回答）を回答の末尾に明記すること。`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: geminiModel,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      context7ResolveLibrary,
      context7QueryDocs,
      tavilySearch,
      compareLibraries,
    },
    stopWhen: stepCountIs(10),
  });

  return result.toUIMessageStreamResponse();
}
