import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { geminiModel } from "@/lib/ai/model";
import {
  context7ResolveLibrary,
  context7QueryDocs,
  tavilySearch,
} from "@/lib/ai/tools";

const systemPrompt = `あなたはライブラリ・フレームワークのドキュメントを検索して回答するAIエージェントです。

## ツール使用ルール
1. ライブラリ・フレームワークに関する質問は、まず context7ResolveLibrary でライブラリIDを取得し、次に context7QueryDocs でドキュメントを検索すること。
2. Context7で十分な情報が得られない場合は tavilySearch でWeb検索すること。
3. いずれのツールでも情報が得られない場合のみ、知識から直接回答すること。

## 回答ルール
- 日本語で簡潔かつ正確に回答すること。
- コードサンプルは必要な場合のみ含める。
- 情報ソース（Context7 / Web検索 / 直接回答）を回答の末尾に明記すること。`;

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response("GOOGLE_GENERATIVE_AI_API_KEY が設定されていません", {
      status: 500,
    });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: geminiModel,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      context7ResolveLibrary,
      context7QueryDocs,
      tavilySearch,
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
