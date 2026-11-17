/**
 * Lesson 2 — Being clear and direct
 * https://academy.claude.com/courses/building-with-the-claude-api/being-clear-and-direct
 *
 * Technique: open with a direct instruction, not a question. Start with an
 * action verb ("Generate", "Write", "Identify"), say what the output is,
 * and add the key constraints in the same sentence.
 *
 *   v1: What should this person eat?
 *   v2: Generate a one-day meal plan for an athlete that meets their
 *       dietary restrictions.
 *
 * Only the first line changes. In the course this alone moves the
 * average score from 2.32 to 3.92.
 *
 * Run: npm run lesson lessons/03-prompt-engineering/02-being-clear-and-direct.ts
 */
import { type Messages, addUserMessage, chat } from '@/lib/messages.ts'
import type { PromptInputs } from '@/lib/prompt-evaluator/index.ts'

import { evaluateMealPlanPrompt } from './meal-plan.ts'

const runPrompt = async (promptInputs: PromptInputs) => {
  const prompt = `
Generate a one-day meal plan for an athlete that meets their dietary restrictions.

- Height: ${promptInputs.height}
- Weight: ${promptInputs.weight}
- Goal: ${promptInputs.goal}
- Dietary restrictions: ${promptInputs.restrictions}
`

  const messages: Messages = []
  addUserMessage(messages, prompt)
  return chat(messages)
}

await evaluateMealPlanPrompt(runPrompt)
