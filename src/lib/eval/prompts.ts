// The prompt under test. Step 5 of the eval workflow is "change the prompt
// and repeat" — so every version stays here and you pick one by name.
import type { TestCase } from './dataset.ts'

const formatLabel: Record<TestCase['format'], string> = {
  typescript: 'TypeScript',
  json: 'JSON',
  regex: 'a plain regular expression',
}

export const prompts = {
  // Lesson 4: deliberately naive, no format rules → verbose answers.
  v1: ({ task }: TestCase) => `
Please solve the following task:

${task}
`,

  // Lesson 6: tell Claude exactly what shape the output must have.
  // (The course also prefills "```code"; that's a 400 now, so the
  // instructions carry the whole load.)
  v2: ({ task, format }: TestCase) => `
Please solve the following task:

${task}

Rules:
* Respond only with ${formatLabel[format]}, nothing else
* No markdown code fences
* No comments, commentary or explanation
`,
} satisfies Record<string, (testCase: TestCase) => string>

export type PromptVersion = keyof typeof prompts

export const isPromptVersion = (value: string): value is PromptVersion =>
  Object.hasOwn(prompts, value)
