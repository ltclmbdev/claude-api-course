// Lesson 5 — Model based grading
//
// Three kinds of graders: code (programmatic checks), model (another LLM
// call), human. This is the model one: it judges whether the output
// actually solves the task — the flexible, "fuzzy" part code can't check.
//
// Python: grade_by_model(test_case, output)
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import ts from 'typescript'
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

// ---------------------------------------------------------------------------
// Lesson 6 — Code based grading
//
// Deterministic, free and instant: does the output parse in the requested
// format? 10 if it does, 0 if not. The model grader judges "does it solve
// the task", this one judges "is it clean, valid code and nothing else".
//
// Python: validate_json / validate_python / validate_regex + grade_syntax.
// The tasks are TypeScript instead of Python, so validate_python becomes
// validateTypeScript.

// Python: json.loads
const validateJson = (text: string) => {
  try {
    JSON.parse(text.trim())
    return 10
  } catch {
    return 0
  }
}

// Python: ast.parse → the TypeScript compiler's own parser.
// transpileModule reports syntax errors only, no type checking — the same
// level of check as ast.parse.
const validateTypeScript = (text: string) => {
  const { diagnostics = [] } = ts.transpileModule(text.trim(), {
    reportDiagnostics: true,
  })
  return diagnostics.length === 0 ? 10 : 0
}

// Python: re.compile → new RegExp (JS regex syntax, not Python's).
// Accepts both `^a+$` and the literal form `/^a+$/i`.
// Must be a single line: almost any prose is a "valid" regex otherwise.
const validateRegex = (text: string) => {
  const source = text.trim()
  if (source.includes('\n')) return 0

  const literal = /^\/(.+)\/([dgimsuvy]*)$/.exec(source)
  try {
    if (literal) new RegExp(literal[1]!, literal[2])
    else new RegExp(source)
    return 10
  } catch {
    return 0
  }
}

const validators: Record<TestCase['format'], (text: string) => number> = {
  typescript: validateTypeScript,
  json: validateJson,
  regex: validateRegex,
}

// Picks the validator by the test case's format — that's what the
// `format` field in the dataset is for.
export const gradeSyntax = (output: string, testCase: TestCase) => {
  // Code fences are a format violation even when the parser tolerates them:
  // ```ts ... ``` happens to be a valid TypeScript template literal.
  if (output.includes('```')) return 0
  return validators[testCase.format](output)
}
