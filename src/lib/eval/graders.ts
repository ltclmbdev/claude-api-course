// Lesson 5 — Model based grading
//
// Three kinds of graders: code (programmatic checks), model (another LLM
// call), human. This is the model one: it judges whether the output
// actually solves the task — the flexible, "fuzzy" part code can't check.
//
// Python: grade_by_model(test_case, output)
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'

import { client, models } from '../client.ts'
import type { TestCase } from './dataset.ts'

// Asking for strengths and weaknesses before the score keeps the grader
// from defaulting to a safe middle score like 6.
// Structured outputs replace the course's "```json" prefill + json.loads.
const ModelGrade = z.object({
  strengths: z.array(z.string()).describe('1-3 key strengths'),
  weaknesses: z.array(z.string()).describe('1-3 key areas for improvement'),
  reasoning: z.string().describe('A concise explanation of the assessment'),
  score: z.number().int().min(1).max(10),
})
export type ModelGrade = z.infer<typeof ModelGrade>

export const gradeByModel = async (
  testCase: TestCase,
  output: string
): Promise<ModelGrade> => {
  const prompt = `
You are an expert code reviewer. Evaluate this AI-generated solution.

<task>
${testCase.task}
</task>

<solution>
${output}
</solution>

First list the strengths and weaknesses of the solution, then give it a
score from 1 to 10.
`

  const message = await client.messages.parse({
    model: models.dev,
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
    output_config: { format: zodOutputFormat(ModelGrade) },
  })

  if (!message.parsed_output) {
    throw new Error(`Grader returned no grade (stop: ${message.stop_reason})`)
  }

  return message.parsed_output
}
