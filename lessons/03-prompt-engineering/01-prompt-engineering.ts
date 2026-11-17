/**
 * Lesson 1 — Prompt engineering
 * https://academy.claude.com/courses/building-with-the-claude-api/prompt-engineering
 *
 * Code: src/lib/prompt-evaluator (generateDataset, runEvaluation, HTML report),
 *       ./meal-plan.ts (dataset + criteria shared by every lesson here)
 *
 * The task for the whole module: a 1-day meal plan for an athlete.
 * This first prompt is deliberately naive — it's the baseline. Each next
 * lesson applies one technique and re-runs the eval to see if it helps.
 *
 * The dataset is generated on the first run and reused after that, so
 * prompt versions are compared on the same cases. To make a new one:
 *   npm run lesson -- lessons/03-prompt-engineering/01-prompt-engineering.ts --regenerate
 *
 * Run: npm run lesson lessons/03-prompt-engineering/01-prompt-engineering.ts
 */
import { type Messages, addUserMessage, chat } from '@/lib/messages.ts'
import type { PromptInputs } from '@/lib/prompt-evaluator/index.ts'

import { evaluateMealPlanPrompt } from './meal-plan.ts'

// The prompt under test — v1, the naive baseline.
const runPrompt = async (promptInputs: PromptInputs) => {
  const prompt = `
What should this person eat?

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
