/**
 * Lesson 1 — Prompt engineering
 * https://academy.claude.com/courses/building-with-the-claude-api/prompt-engineering
 *
 * Code: src/lib/prompt-evaluator (generateDataset, runEvaluation, HTML report)
 *
 * The task for the whole module: a 1-day meal plan for an athlete.
 * This first prompt is deliberately naive — it's the baseline. Each next
 * lesson applies one technique and re-runs the eval to see if it helps.
 *
 * The dataset is generated on the first run and reused after that, so
 * prompt versions are compared on the same cases. Pass --regenerate to
 * make a new one.
 *
 * Run: npm run lesson lessons/03-prompt-engineering/01-prompt-engineering.ts
 */
import { join } from 'node:path'

import { type Messages, addUserMessage, chat } from '@/lib/messages.ts'
import {
  type PromptInputs,
  fileExists,
  generateDataset,
  runEvaluation,
} from '@/lib/prompt-evaluator/index.ts'

const datasetFile = join(import.meta.dirname, 'data/dataset.json')

if (process.argv.includes('--regenerate') || !(await fileExists(datasetFile))) {
  console.log('Generating dataset...')
  await generateDataset({
    taskDescription:
      'Write a compact, concise 1 day meal plan for a single athlete',
    promptInputsSpec: {
      height: "Athlete's height in cm",
      weight: "Athlete's weight in kg",
      goal: 'Goal of the athlete',
      restrictions: 'Dietary restrictions of the athlete',
    },
    outputFile: datasetFile,
    numCases: 3,
  })
}

// The prompt under test — v1, the naive baseline.
const runPrompt = async (promptInputs: PromptInputs) => {
  const prompt = `
What should this person eat?

- Height: ${promptInputs.height}
- Weight: ${promptInputs.weight}
- Goal: ${promptInputs.goal}
- Dietary restrictions: ${promptInputs.restrictions}
`

  const messages: Messages = []
  addUserMessage(messages, prompt)
  return chat(messages)
}

console.log('Running evaluation...')
const { averageScore, reportFile } = await runEvaluation({
  runPrompt,
  datasetFile,
  concurrency: 3,
  extraCriteria: `
The output should include:
- Daily caloric total
- Macronutrient breakdown
- Meals with exact foods, portions, and timing
`,
})

console.log(`\nAverage score: ${averageScore.toFixed(2)}`)
console.log(`Report: ${reportFile}`)
