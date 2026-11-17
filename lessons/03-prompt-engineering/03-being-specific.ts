/**
 * Lesson 3 — Being specific
 * https://academy.claude.com/courses/building-with-the-claude-api/being-specific
 *
 * Technique: add guidelines. Two kinds:
 *   - output quality: length, structure, format, required elements, tone
 *   - process steps: how to work through the problem (brainstorm → pick →
 *     outline). Worth adding for complex problems.
 * Always add quality guidelines; combine with steps when the task needs it.
 *
 * Here: output quality guidelines that spell out what a good meal plan
 * contains. In the course the score goes from 3.92 to 7.86.
 *
 * Run: npm run lesson lessons/03-prompt-engineering/03-being-specific.ts
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

Guidelines:
1. Give an accurate total daily calorie amount
2. Show protein, fat and carbohydrate amounts
3. Say when to eat each meal
4. Use only foods that fit the dietary restrictions
5. List every portion size in grams
6. Keep it budget-friendly if the athlete mentions a budget
`

  const messages: Messages = []
  addUserMessage(messages, prompt)
  return chat(messages)
}

await evaluateMealPlanPrompt(runPrompt)
