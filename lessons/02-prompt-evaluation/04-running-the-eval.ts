/**
 * Lesson 4 — Running the eval
 * https://academy.claude.com/courses/building-with-the-claude-api/running-the-eval
 *
 * Code: src/lib/eval/runner.ts (runPrompt → runTestCase → runEval)
 * Grading is still a placeholder: every result gets 10. Look at the
 * outputs instead — the naive v1 prompt makes them long and chatty.
 *
 * Run: npm run lesson lessons/02-prompt-evaluation/04-running-the-eval.ts
 */
import { loadDataset } from '@/lib/eval/dataset.ts'
import { constantGrader } from '@/lib/eval/graders.ts'
import { runEval, saveResults } from '@/lib/eval/runner.ts'

const dataset = await loadDataset()

console.log(`Running ${dataset.length} test cases with prompt v1...`)
const report = await runEval(dataset, { version: 'v1', grader: constantGrader })

for (const { testCase, output } of report.results) {
  console.log(`\n--- ${testCase.task} (${testCase.format})\n${output}`)
}

const path = await saveResults('04-no-grader', report)
console.log(`\nResults: ${path}`)
