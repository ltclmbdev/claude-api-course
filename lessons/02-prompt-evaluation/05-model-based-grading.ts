/**
 * Lesson 5 — Model based grading
 * https://academy.claude.com/courses/building-with-the-claude-api/model-based-grading
 *
 * Code: gradeByModel in src/lib/eval/graders.ts
 * Three grader types: code (programmatic), model (another LLM call), human.
 * The model grader judges "did it follow the task" — the flexible part.
 *
 * Run: npm run lesson lessons/02-prompt-evaluation/05-model-based-grading.ts
 */
import { loadDataset } from '@/lib/eval/dataset.ts'
import { modelGrader } from '@/lib/eval/graders.ts'
import { runEval, saveResults } from '@/lib/eval/runner.ts'

const dataset = await loadDataset()

console.log(`Grading ${dataset.length} test cases with a model grader...`)
const report = await runEval(dataset, { version: 'v1', grader: modelGrader })

for (const { testCase, score, reasoning } of report.results) {
  console.log(`\n${score}/10  ${testCase.task}\n  ${reasoning}`)
}

console.log(`\nAverage score: ${report.averageScore.toFixed(2)}`)
const path = await saveResults('05-model-grader', report)
console.log(`Results: ${path}`)
