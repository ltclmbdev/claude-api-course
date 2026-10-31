import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import ts from 'typescript'
import { z } from 'zod'

import { client, models } from '../client.ts'
import type { TestCase } from './dataset.ts'

export type Grade = {
  score: number
  reasoning?: string
}

export type Grader = (testCase: TestCase, output: string) => Promise<Grade>

// Lesson 4 — placeholder until real graders exist.
export const constantGrader: Grader = async () => ({ score: 10 })

// ---------------------------------------------------------------------------
// Lesson 5 — Model based grading
//
// Asking for strengths and weaknesses before the score pushes the grader
// away from a lazy "6/10". Structured outputs replace the course's prefill
// and guarantee the shape, so no JSON.parse try/catch is needed.

const ModelGrade = z.object({
  strengths: z.array(z.string()).describe('1-3 key strengths'),
  weaknesses: z.array(z.string()).describe('1-3 key areas for improvement'),
  reasoning: z.string().describe('A concise explanation of the assessment'),
  score: z.number().int().min(1).max(10),
})
export type ModelGrade = z.infer<typeof ModelGrade>

export const gradeByModel = async (
  { task }: TestCase,
  solution: string
): Promise<ModelGrade> => {
  const prompt = `
You are an expert code reviewer. Evaluate this AI-generated solution.

<task>
${task}
</task>

<solution>
${solution}
</solution>

List strengths and weaknesses first, then give a score from 1 to 10.
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

export const modelGrader: Grader = async (testCase, output) => {
  const { score, reasoning } = await gradeByModel(testCase, output)
  return { score, reasoning }
}

// ---------------------------------------------------------------------------
// Lesson 6 — Code based grading
//
// Deterministic, free and instant: does the output parse in the requested
// format? 10 if yes, 0 if not. Anything around the code (prose, fences)
// makes it fail — which is the point: the format rule is part of the task.

const validateJson = (text: string) => {
  try {
    JSON.parse(text.trim())
    return 10
  } catch {
    return 0
  }
}

// Python's ast.parse → the TypeScript compiler's own parser.
const validateTypeScript = (text: string) => {
  const { diagnostics = [] } = ts.transpileModule(text.trim(), {
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2023 },
  })
  return diagnostics.length === 0 ? 10 : 0
}

// re.compile → new RegExp. JS regex syntax, not Python's.
const validateRegex = (text: string) => {
  const source = text.trim()
  // Accept both `^a+$` and the literal form `/^a+$/i`.
  const literal = /^\/(.+)\/([dgimsuvy]*)$/s.exec(source)
  try {
    if (literal) new RegExp(literal[1]!, literal[2])
    else new RegExp(source)
    return 10
  } catch {
    return 0
  }
}

// A regex must be one line: almost any prose is a "valid" regex otherwise.
const validateSingleLineRegex = (text: string) =>
  text.trim().includes('\n') ? 0 : validateRegex(text)

const validators: Record<TestCase['format'], (text: string) => number> = {
  typescript: validateTypeScript,
  json: validateJson,
  regex: validateSingleLineRegex,
}

export const gradeSyntax = (output: string, { format }: TestCase) => {
  // Fences are a format violation even when the parser tolerates them —
  // e.g. ```ts ... ``` is a valid TypeScript template literal.
  if (output.includes('```')) return 0
  return validators[format](output)
}

// Model score for "did it do the task", syntax score for "is it valid,
// clean code". Equal weights, like the course — tune them per use case.
export const combinedGrader: Grader = async (testCase, output) => {
  const modelGrade = await gradeByModel(testCase, output)
  const syntaxScore = gradeSyntax(output, testCase)

  return {
    score: (modelGrade.score + syntaxScore) / 2,
    reasoning: `syntax ${syntaxScore}/10 · model ${modelGrade.score}/10 — ${modelGrade.reasoning}`,
  }
}
