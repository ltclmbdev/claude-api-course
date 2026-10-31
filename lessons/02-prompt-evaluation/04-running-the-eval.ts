/**
 * Lesson 4 — Running the eval
 * https://academy.claude.com/courses/building-with-the-claude-api/running-the-eval
 *
 * Code: src/lib/eval/runner.ts
 * Needs data/dataset.json from lesson 3.
 *
 * Grading is still a placeholder (every score is 10), so look at the
 * outputs themselves: with no format rules in the prompt they come back
 * long, chatty and wrapped in code fences.
 *
 * Run: npm run lesson lessons/02-prompt-evaluation/04-running-the-eval.ts
 */
import { loadDataset } from '@/lib/eval/dataset.ts'
import { runEval } from '@/lib/eval/runner.ts'

const dataset = await loadDataset()

const start = performance.now()
const results = await runEval(dataset)
const seconds = ((performance.now() - start) / 1000).toFixed(1)

// Python: print(json.dumps(results, indent=2))
console.log(JSON.stringify(results, null, 2))
console.log(`\n${results.length} test cases in ${seconds}s`)
