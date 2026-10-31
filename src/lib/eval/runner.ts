// Lesson 4 — Running the eval
//
// run_prompt → runPrompt, run_test_case → runTestCase, run_eval → runEval.
// One difference: the course runs test cases one by one (~30 s for a small
// dataset). Here they run a few at a time; concurrency=1 gives the course's
// behaviour.
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { type Messages, addUserMessage, chat } from '../messages.ts'
import { DATA_DIR, type TestCase } from './dataset.ts'
import type { Grader } from './graders.ts'
import { type PromptVersion, prompts } from './prompts.ts'

export type EvalResult = {
  testCase: TestCase
  output: string
  score: number
  reasoning?: string
}

export const runPrompt = async (testCase: TestCase, version: PromptVersion) => {
  const messages: Messages = []
  addUserMessage(messages, prompts[version](testCase))
  return chat(messages)
}

export const runTestCase = async (
  testCase: TestCase,
  version: PromptVersion,
  grader: Grader
): Promise<EvalResult> => {
  const output = await runPrompt(testCase, version)
  const grade = await grader(testCase, output)
  return { testCase, output, ...grade }
}

// Tiny worker pool — no dependency needed for this.
const mapWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
) => {
  const results = new Array<R>(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await fn(items[index]!, index)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}

export type RunEvalOptions = {
  version: PromptVersion
  grader: Grader
  concurrency?: number
}

export const runEval = async (
  dataset: TestCase[],
  { version, grader, concurrency = 3 }: RunEvalOptions
) => {
  const results = await mapWithConcurrency(
    dataset,
    concurrency,
    async (testCase, index) => {
      const result = await runTestCase(testCase, version, grader)
      console.log(
        `  [${index + 1}/${dataset.length}] ${result.score.toFixed(1)}  ${testCase.task}`
      )
      return result
    }
  )

  const averageScore =
    results.reduce((sum, { score }) => sum + score, 0) / results.length

  return { version, averageScore, results }
}

export const saveResults = async (
  name: string,
  report: Awaited<ReturnType<typeof runEval>>
) => {
  await mkdir(DATA_DIR, { recursive: true })
  const path = join(DATA_DIR, `results-${name}-${report.version}.json`)
  await writeFile(path, JSON.stringify(report, null, 2) + '\n')
  return path
}
