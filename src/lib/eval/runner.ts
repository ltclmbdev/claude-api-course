// Lesson 4 — Running the eval
//
// Three functions, same as the course:
//   run_prompt    → runPrompt     test case + prompt template → Claude's output
//   run_test_case → runTestCase   runPrompt + grading → one result
//   run_eval      → runEval       runTestCase for every test case
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { type Messages, addUserMessage, chat } from '../messages.ts'
import { DATA_DIR, type TestCase } from './dataset.ts'
import { gradeByModel } from './graders.ts'

export type EvalResult = {
  output: string
  testCase: TestCase
  score: number
  reasoning: string
}

// Merges the prompt and the test case, returns Claude's answer.
// The prompt is deliberately naive: no rules about the output format.
export const runPrompt = async (testCase: TestCase) => {
  const prompt = `
Please solve the following task:

${testCase.task}
`

  const messages: Messages = []
  addUserMessage(messages, prompt)
  return chat(messages)
}

// Runs the prompt, then grades the output.
export const runTestCase = async (testCase: TestCase): Promise<EvalResult> => {
  const output = await runPrompt(testCase)

  // Lesson 5: the hardcoded 10 is replaced by a model grader.
  // strengths/weaknesses are only there to make the grader think;
  // the result keeps the score and the reasoning.
  const { score, reasoning } = await gradeByModel(testCase, output)

  return { output, testCase, score, reasoning }
}

// Runs every test case one after another, like the course.
// Each case waits for the previous one; try replacing the loop with
// `Promise.all(dataset.map(runTestCase))` and compare the run time.
export const runEval = async (dataset: TestCase[]) => {
  const results: EvalResult[] = []

  for (const testCase of dataset) {
    const result = await runTestCase(testCase)
    results.push(result)
  }

  return results
}

// Lesson 5: one number to compare prompt versions by.
export const averageScore = (results: EvalResult[]) =>
  results.reduce((sum, { score }) => sum + score, 0) / results.length

// Not in the course: keep every run on disk to re-read outputs and compare
// prompt versions later. One file per run, e.g.
// data/results-2026-11-07T19-45-12.345Z.json (colons aren't allowed in
// file names on every OS). Git-ignored, unlike dataset.json.
export const saveResults = async (results: EvalResult[]) => {
  await mkdir(DATA_DIR, { recursive: true })
  const timestamp = new Date().toISOString().replaceAll(':', '-')
  const path = join(DATA_DIR, `results-${timestamp}.json`)
  await writeFile(path, JSON.stringify(results, null, 2) + '\n')
  return path
}
