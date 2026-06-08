import { readFileSync, appendFileSync } from "fs";
import OpenAI from "openai";

const MAX_CHARS = 80_000;

function writeToStepSummary(body) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    appendFileSync(summaryPath, body);
  } else {
    console.log("[Step Summary 미지원 환경] 리뷰 결과:\n", body);
  }
}

async function main() {
  let diff = readFileSync("pr_diff.txt", "utf-8");

  if (!diff.trim()) {
    console.log("변경사항 없음, 리뷰 스킵");
    return;
  }

  const truncated = diff.length > MAX_CHARS;
  if (truncated) diff = diff.slice(0, MAX_CHARS);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `You are a senior React/TypeScript developer. Please review the PR diff below and respond in Korean.
Project: React 19 + TypeScript + Firebase + Tailwind CSS advent calendar app

Review criteria:
1. TypeScript type safety (overuse of any, missing types, etc.)
2. React patterns (hooks rules, unnecessary re-renders, component structure)
3. Firebase usage (Timestamp conversion, error handling, security rule violations)
4. Security (XSS, exposed sensitive info, auth bypass possibilities)
5. Bug risks (runtime errors, missing edge cases)
6. Code quality (readability, DRY, duplicate logic)
7. Naming conventions (variables, functions, components — clarity, consistency, and intent)
8. Performance (unnecessary useEffect, missing optimization, memoization needs)
9. Error boundaries (missing try/catch, insufficient async error handling)
10. Component size (oversized components, need for separation)

Format:
- 🔴 **Critical** — must fix
- 🟡 **Warning** — recommended fix
- 🟢 **Suggestion** — improvement ideas
- ✅ **Good** — well done

If overall looks good, a short compliment is fine. Keep feedback concise and actionable.

\`\`\`diff
${diff}
\`\`\`
${truncated ? "\n> ⚠️  diff가 너무 커서 앞부분만 리뷰되었습니다." : ""}`;

  const model = "gpt-5.1-codex-mini";
  const context = [{ role: "user", content: prompt }];

  const response = await client.responses.create({
    model: model,
    input: context,
    max_output_tokens: 2000,
  });

  const review = response.output_text;
  if (!review.trim()) {
    console.log("리뷰 내용 없음, 코멘트 생략");
    return;
  }
  writeToStepSummary(
    `## AI 코드 리뷰\n\n${review}\n\n---\n*Powered by OpenAI ${model}*\n`,
  );
  console.log("Step Summary 등록 완료");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
