/**
 * Lesson 4 — Running the eval
 * https://academy.claude.com/courses/building-with-the-claude-api/running-the-eval
 *
 * Code: src/lib/eval/runner.ts
 * Needs data/dataset.json from lesson 3.
 *
 * In this lesson grading was a placeholder (every score 10). Since lesson 5,
 * runTestCase grades with a model, so this script now prints real scores too.
 * The point here is still the outputs: with no format rules in the prompt
 * they come back long, chatty and wrapped in code fences.
 *
 * Run: npm run lesson lessons/02-prompt-evaluation/04-running-the-eval.ts
 */
import { loadDataset } from '@/lib/eval/dataset.ts'
import { runEval, saveResults } from '@/lib/eval/runner.ts'

const dataset = await loadDataset()

const start = performance.now()
const results = await runEval(dataset)
const seconds = ((performance.now() - start) / 1000).toFixed(1)

// Python: print(json.dumps(results, indent=2))
console.log(JSON.stringify(results, null, 2))
console.log(`\n${results.length} test cases in ${seconds}s`)

const path = await saveResults(results)
console.log(`Saved to ${path}`)
