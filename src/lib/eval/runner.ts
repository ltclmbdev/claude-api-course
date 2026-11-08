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
import { gradeByModel, gradeSyntax } from './graders.ts'

export type EvalResult = {
  output: string
  testCase: TestCase
  score: number
  modelScore: number
  syntaxScore: number
  reasoning: string
}

const formatLabel: Record<TestCase['format'], string> = {
  typescript: 'TypeScript',
  json: 'JSON',
  regex: 'a plain regular expression',
}

// Merges the prompt and the test case, returns Claude's answer.
//
// Lesson 6: the prompt now says exactly what shape the output must have.
// The course also prefills the assistant turn with "```code" so Claude
// starts writing code straight away. Prefill returns a 400 on current
// models, so here the rules have to do all the work — the syntax grader
// shows whether they do.
export const runPrompt = async (testCase: TestCase) => {
  const prompt = `
Please solve the following task:

${testCase.task}

* Respond only with ${formatLabel[testCase.format]}
* Do not wrap the response in markdown code fences
* Do not add any comments, commentary or explanation
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
  const { score: modelScore, reasoning } = await gradeByModel(testCase, output)

  // Lesson 6: plus a code grader. Equal weights, like the course —
  // tune them to what matters more for your prompt.
  const syntaxScore = gradeSyntax(output, testCase)
  const score = (modelScore + syntaxScore) / 2

  return { output, testCase, score, modelScore, syntaxScore, reasoning }
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
