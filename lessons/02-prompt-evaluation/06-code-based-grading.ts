/**
 * Lesson 6 — Code based grading
 * https://academy.claude.com/courses/building-with-the-claude-api/code-based-grading
 *
 * Code: gradeSyntax + combinedGrader in src/lib/eval/graders.ts,
 *       prompt versions in src/lib/eval/prompts.ts
 *
 * The full loop: run a prompt version, score it with model + syntax
 * graders, compare averages. Expect v1 to lose on syntax (prose and code
 * fences don't parse) and v2 to win.
 *
 * Run: npm run lesson lessons/02-prompt-evaluation/06-code-based-grading.ts [v1|v2 ...]
 *      (no args = compare all versions)
 */
import { loadDataset } from '@/lib/eval/dataset.ts'
import { combinedGrader } from '@/lib/eval/graders.ts'
import { isPromptVersion, prompts } from '@/lib/eval/prompts.ts'
import { runEval, saveResults } from '@/lib/eval/runner.ts'

const args = process.argv.slice(2)
const versions = args.length > 0 ? args : Object.keys(prompts)

const invalid = versions.filter((v) => !isPromptVersion(v))
if (invalid.length > 0) {
  throw new Error(
    `Unknown prompt version: ${invalid.join(', ')}. Use: ${Object.keys(prompts).join(', ')}`
  )
}

const dataset = await loadDataset()
const summary: Record<string, string> = {}

for (const version of versions.filter(isPromptVersion)) {
  console.log(`\nPrompt ${version}:`)
  const report = await runEval(dataset, { version, grader: combinedGrader })

  for (const { testCase, score, reasoning } of report.results) {
    console.log(
      `\n  ${score.toFixed(1)}  ${testCase.task}\n       ${reasoning}`
    )
  }

  await saveResults('06-combined', report)
  summary[version] = report.averageScore.toFixed(2)
}

console.log('\nAverage score by prompt version:')
console.table(summary)
