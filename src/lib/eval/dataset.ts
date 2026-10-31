// Lesson 3 — Generating test datasets
//
// The course generates the dataset with an assistant prefill ("```json") and
// a stop sequence. Prefill returns a 400 on current models, so this uses
// structured outputs instead: the schema doubles as the TS type.
//
// One deliberate change: the course asks for Python tasks and validates them
// with Python's `ast.parse`. Here the formats are TypeScript / JSON / regex,
// so all three can be validated with tools that exist in Node.
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { z } from 'zod'

import { client, models } from '../client.ts'

export const formats = ['typescript', 'json', 'regex'] as const

export const TestCase = z.object({
  task: z.string(),
  format: z.enum(formats),
})
export type TestCase = z.infer<typeof TestCase>

const Dataset = z.object({ testCases: z.array(TestCase) })

export const DATA_DIR = join(
  import.meta.dirname,
  '../../../lessons/02-prompt-evaluation/data'
)
export const DATASET_PATH = join(DATA_DIR, 'dataset.json')

export const generateDataset = async (count = 3) => {
  const prompt = `
Generate an evaluation dataset for a prompt that helps developers with AWS.
Each test case is a task that can be solved with exactly one of:
- a single TypeScript function
- a single JSON object
- a single regular expression

Mix the three formats. Keep each task to one sentence.
Generate ${count} test cases.
`

  // Haiku is enough for test data: it doesn't need the strongest model.
  const message = await client.messages.parse({
    model: models.dev,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
    // The API requires an object at the top level, so the array is wrapped.
    output_config: { format: zodOutputFormat(Dataset) },
  })

  if (!message.parsed_output) {
    throw new Error(`No dataset in response (stop: ${message.stop_reason})`)
  }

  return message.parsed_output.testCases
}

export const saveDataset = async (dataset: TestCase[], path = DATASET_PATH) => {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(dataset, null, 2) + '\n')
}

export const loadDataset = async (path = DATASET_PATH) => {
  const raw: unknown = JSON.parse(await readFile(path, 'utf8'))
  // Validate on read: a hand-edited dataset.json fails loudly here.
  return z.array(TestCase).parse(raw)
}
