// Module 3 — prompt evaluator
//
// The course hands out a ready-made Python PromptEvaluator class and uses
// it in every prompt engineering lesson. Here it's two plain functions —
// the class only held one setting (max_concurrent_tasks), which is now the
// `concurrency` option of runEvaluation. Built from what module 2 taught:
//
//   generateDataset  → test cases for any task, from a description of it
//                      and the inputs the prompt takes (lesson 3 of module 2)
//   runEvaluation    → run the prompt on every case, grade with a model
//                      (lessons 4-5), several cases at a time, then write
//                      results + an HTML report
//
// Differences from the module 2 code: prompt inputs are arbitrary
// (height, weight, goal...), each test case carries its own solution
// criteria, and you can add extra criteria every output must meet.
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { z } from 'zod'

import { client, models } from '../client.ts'
import { renderReport } from './report.ts'

// Name of each input → what it means, e.g. { height: 'Height in cm' }
export type PromptInputsSpec = Record<string, string>
export type PromptInputs = Record<string, string>

const TestCase = z.object({
  scenario: z.string(),
  promptInputs: z.record(z.string(), z.string()),
  solutionCriteria: z.array(z.string()),
})
export type TestCase = z.infer<typeof TestCase>

const Grade = z.object({
  strengths: z.array(z.string()).describe('1-3 key strengths'),
  weaknesses: z.array(z.string()).describe('1-3 key areas for improvement'),
  reasoning: z.string().describe('A concise explanation of the score'),
  score: z.number().int().min(1).max(10),
})
type Grade = z.infer<typeof Grade>

export type EvaluationResult = Grade & { testCase: TestCase; output: string }

// The prompt under test: takes one test case's inputs, returns the answer.
export type RunPrompt = (promptInputs: PromptInputs) => Promise<string>

export const fileExists = (path: string) =>
  access(path).then(
    () => true,
    () => false
  )

const mapWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
) => {
  const results = new Array<R>(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await fn(items[index]!)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}

// Python: evaluator.generate_dataset(...)
export const generateDataset = async ({
  taskDescription,
  promptInputsSpec,
  outputFile,
  numCases = 3,
}: {
  taskDescription: string
  promptInputsSpec: PromptInputsSpec
  outputFile: string
  numCases?: number
}) => {
  // Structured outputs need fixed property names, so the schema for
  // promptInputs is built from the spec: { height: string, weight: ... }
  const inputsSchema = z.object(
    Object.fromEntries(
      Object.keys(promptInputsSpec).map((key) => [key, z.string()])
    )
  )
  const Dataset = z.object({
    testCases: z.array(TestCase.extend({ promptInputs: inputsSchema })),
  })

  const inputsList = Object.entries(promptInputsSpec)
    .map(([key, description]) => `- ${key}: ${description}`)
    .join('\n')

  const prompt = `
Generate ${numCases} test cases for evaluating a prompt that does this task:

<task_description>
${taskDescription}
</task_description>

The prompt takes these inputs:
<prompt_inputs>
${inputsList}
</prompt_inputs>

For each test case:
- scenario: one sentence describing the situation it tests
- promptInputs: realistic values for every input
- solutionCriteria: 1-4 concrete, checkable things a good answer must do

Make the test cases distinctly different from each other, including at
least one edge case.
`

  const message = await client.messages.parse({
    model: models.dev,
    max_tokens: 1000 + numCases * 500,
    messages: [{ role: 'user', content: prompt }],
    output_config: { format: zodOutputFormat(Dataset) },
  })

  if (!message.parsed_output) {
    throw new Error(`No dataset in response (stop: ${message.stop_reason})`)
  }

  const { testCases } = message.parsed_output
  await mkdir(dirname(outputFile), { recursive: true })
  await writeFile(outputFile, JSON.stringify(testCases, null, 2) + '\n')
  return testCases
}

const gradeOutput = async (
  testCase: TestCase,
  output: string,
  extraCriteria?: string
) => {
  const extra = extraCriteria
    ? `
Mandatory requirements — if the output misses any of them, the score
must be 3 or lower, no matter how good the rest is:
<extra_criteria>
${extraCriteria}
</extra_criteria>
`
    : ''

  const prompt = `
You are an expert evaluator. Grade this AI-generated output.

<scenario>
${testCase.scenario}
</scenario>

<inputs>
${JSON.stringify(testCase.promptInputs, null, 2)}
</inputs>

<solution_criteria>
${testCase.solutionCriteria.map((c) => `- ${c}`).join('\n')}
</solution_criteria>
${extra}
<output>
${output}
</output>

List strengths and weaknesses first, then give a score from 1 to 10.
`

  const message = await client.messages.parse({
    model: models.dev,
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
    output_config: { format: zodOutputFormat(Grade) },
  })

  if (!message.parsed_output) {
    throw new Error(`Grader returned no grade (stop: ${message.stop_reason})`)
  }

  return message.parsed_output
}

// Python: evaluator.run_evaluation(...); max_concurrent_tasks → concurrency.
// Start around 3; raise it if you don't hit rate limits.
export const runEvaluation = async ({
  runPrompt,
  datasetFile,
  extraCriteria,
  concurrency = 3,
}: {
  runPrompt: RunPrompt
  datasetFile: string
  extraCriteria?: string
  concurrency?: number
}) => {
  const dataset = z
    .array(TestCase)
    .parse(JSON.parse(await readFile(datasetFile, 'utf8')))

  let done = 0
  const results = await mapWithConcurrency(
    dataset,
    concurrency,
    async (testCase): Promise<EvaluationResult> => {
      const output = await runPrompt(testCase.promptInputs)
      const grade = await gradeOutput(testCase, output, extraCriteria)
      console.log(
        `  [${++done}/${dataset.length}] ${grade.score}/10  ${testCase.scenario}`
      )
      return { testCase, output, ...grade }
    }
  )

  const averageScore =
    results.reduce((sum, { score }) => sum + score, 0) / results.length

  // results-<time>.json + report-<time>.html next to the dataset
  const dir = dirname(datasetFile)
  const timestamp = new Date().toISOString().replaceAll(':', '-')
  const resultsFile = join(dir, `results-${timestamp}.json`)
  const reportFile = join(dir, `report-${timestamp}.html`)
  await writeFile(
    resultsFile,
    JSON.stringify({ averageScore, results }, null, 2) + '\n'
  )
  await writeFile(reportFile, renderReport(results, averageScore))

  return { averageScore, results, resultsFile, reportFile }
}
