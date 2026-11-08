/**
 * Lesson 5 — Model based grading
 * https://academy.claude.com/courses/building-with-the-claude-api/model-based-grading
 *
 * Code: src/lib/eval/graders.ts (gradeByModel),
 *       src/lib/eval/runner.ts (runTestCase now grades, averageScore)
 *
 * Every test case now costs two API calls: one to answer, one to grade.
 *
 * Run: npm run lesson lessons/02-prompt-evaluation/05-model-based-grading.ts
 */
import { loadDataset } from '@/lib/eval/dataset.ts'
import { averageScore, runEval, saveResults } from '@/lib/eval/runner.ts'

const dataset = await loadDataset()
const results = await runEval(dataset)

for (const { testCase, score, reasoning } of results) {
  console.log(`\n${score}/10  [${testCase.format}] ${testCase.task}`)
  console.log(`  ${reasoning}`)
}

// Python: print(f"Average score: {average_score}")
console.log(`\nAverage score: ${averageScore(results).toFixed(2)}`)

const path = await saveResults(results)
console.log(`Saved to ${path}`)
