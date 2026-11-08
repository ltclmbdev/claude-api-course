/**
 * Lesson 6 — Code based grading
 * https://academy.claude.com/courses/building-with-the-claude-api/code-based-grading
 *
 * Code: src/lib/eval/graders.ts (validators, gradeSyntax),
 *       src/lib/eval/runner.ts (stricter prompt, combined score)
 *
 * The final score is the average of the model score and the syntax score.
 * Compare the average with your earlier runs in data/results-*.json:
 * those used the naive prompt from lesson 4.
 *
 * Run: npm run lesson lessons/02-prompt-evaluation/06-code-based-grading.ts
 */
import { loadDataset } from '@/lib/eval/dataset.ts'
import { averageScore, runEval, saveResults } from '@/lib/eval/runner.ts'

const dataset = await loadDataset()
const results = await runEval(dataset)

for (const result of results) {
  const { testCase, score, modelScore, syntaxScore, reasoning } = result
  console.log(`\n${score}/10  [${testCase.format}] ${testCase.task}`)
  console.log(`  model ${modelScore}/10 · syntax ${syntaxScore}/10`)
  console.log(`  ${reasoning}`)
}

console.log(`\nAverage score: ${averageScore(results).toFixed(2)}`)

const path = await saveResults(results)
console.log(`Saved to ${path}`)
