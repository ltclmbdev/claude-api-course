// Shared setup for every lesson in this section: the athlete meal plan
// task, its dataset and the mandatory criteria. Each lesson file only
// brings its own version of the prompt, so lesson diffs show nothing but
// the prompt engineering technique.
import { join } from 'node:path'

import {
  type RunPrompt,
  fileExists,
  generateDataset,
  runEvaluation,
} from '@/lib/prompt-evaluator/index.ts'

const datasetFile = join(import.meta.dirname, 'data/dataset.json')

// Generated on the first run and reused after that, so every prompt
// version is graded on the same cases. --regenerate makes a new one:
// npm run lesson -- <lesson file> --regenerate
const ensureDataset = async () => {
  if (
    !process.argv.includes('--regenerate') &&
    (await fileExists(datasetFile))
  ) {
    return
  }

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

export const evaluateMealPlanPrompt = async (runPrompt: RunPrompt) => {
  await ensureDataset()

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
}
