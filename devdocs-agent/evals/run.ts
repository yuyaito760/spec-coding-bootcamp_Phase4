import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import testCases from './test-cases.json';
import fs from 'fs';

interface EvalResult {
  id: string;
  question: string;
  actualAnswer: string;
  expectedTool: string | null;
  score: number;
  passed: boolean;
  feedback: string;
}

function extractTextFromStream(raw: string): string {
  return raw
    .split('\n')
    .filter((line) => line.startsWith('data: '))
    .flatMap((line) => {
      try {
        const data = JSON.parse(line.slice(6));
        return data.type === 'text-delta' && data.delta ? [data.delta] : [];
      } catch {
        return [];
      }
    })
    .join('');
}

async function runEvals() {
  const results: EvalResult[] = [];
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  for (const testCase of testCases.testCases) {
    console.log(`\nTesting: ${testCase.id}`);
    console.log(`Question: ${testCase.question}`);

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            id: '1',
            role: 'user',
            parts: [{ type: 'text', text: testCase.question }],
          }],
        }),
      });

      const rawResponse = await response.text();
      const actualAnswer = extractTextFromStream(rawResponse);
      console.log(`Answer: ${actualAnswer.substring(0, 100)}...`);

      let score = 0;
      let feedback = '';

      if (testCase.expectedKeywords) {
        const foundKeywords = testCase.expectedKeywords.filter((kw: string) =>
          actualAnswer.toLowerCase().includes(kw.toLowerCase())
        );
        score = (foundKeywords.length / testCase.expectedKeywords.length) * 100;
        feedback = `Found ${foundKeywords.length}/${testCase.expectedKeywords.length} keywords: ${foundKeywords.join(', ')}`;
      } else {
        // LLM評価
        const evalResult = await generateText({
          model: google('gemini-2.5-flash-lite'),
          prompt: `質問: ${testCase.question}
回答: ${actualAnswer}
期待される動作: ${testCase.expectedBehavior}

この回答は期待される動作を満たしていますか？
0-100のスコアと理由をJSON形式で返してください。
{"score": 数値, "feedback": "理由"}`,
        });

        try {
          const cleaned = evalResult.text.replace(/```json\n?|\n?```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          score = parsed.score;
          feedback = parsed.feedback;
        } catch {
          score = 50;
          feedback = 'LLM評価のパースに失敗';
        }
      }

      results.push({
        id: testCase.id,
        question: testCase.question,
        actualAnswer: actualAnswer.substring(0, 500),
        expectedTool: testCase.expectedTool,
        score,
        passed: score >= 70,
        feedback,
      });

      console.log(`Score: ${score}, Passed: ${score >= 70}`);
    } catch (error) {
      console.error(`Error testing ${testCase.id}:`, error);
      results.push({
        id: testCase.id,
        question: testCase.question,
        actualAnswer: 'ERROR',
        expectedTool: testCase.expectedTool,
        score: 0,
        passed: false,
        feedback: `Error: ${error}`,
      });
    }
  }

  // サマリー出力
  const summary = {
    timestamp: new Date().toISOString(),
    total: results.length,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
    results,
  };

  console.log('\n=== Evaluation Summary ===');
  console.log(`Total: ${summary.total}`);
  console.log(`Passed: ${summary.passed}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Average Score: ${summary.averageScore.toFixed(1)}`);

  // 結果を保存
  fs.mkdirSync('evals/results', { recursive: true });
  fs.writeFileSync(
    `evals/results/${new Date().toISOString().split('T')[0]}.json`,
    JSON.stringify(summary, null, 2)
  );

  if (summary.averageScore < 70) {
    console.error('\n❌ Evals failed: Average score below threshold');
    process.exit(1);
  }

  console.log('\n✅ Evals passed!');
}

runEvals();
