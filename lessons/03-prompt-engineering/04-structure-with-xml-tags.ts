/**
 * Lesson 4 — Structure with XML tags
 * https://academy.claude.com/courses/building-with-the-claude-api/structure-with-xml-tags
 *
 * Technique: wrap content in descriptive XML tags so Claude can tell
 * instructions from data, and one piece of data from another
 * (e.g. <sales_records>, or <my_code> next to <docs>). Tag names are up
 * to you — make them say what's inside.
 *
 * Here the athlete's details go into <athlete_information>, and the
 * instruction refers to it by name. With a prompt this small the score
 * may barely move; tags pay off as prompts get longer and more mixed.
 *
 * Run: npm run lesson lessons/03-prompt-engineering/04-structure-with-xml-tags.ts
 */
import { type Messages, addUserMessage, chat } from '@/lib/messages.ts'
import type { PromptInputs } from '@/lib/prompt-evaluator/index.ts'

import { evaluateMealPlanPrompt } from './meal-plan.ts'

const runPrompt = async (promptInputs: PromptInputs) => {
  const prompt = `
Generate a one-day meal plan for an athlete that meets their dietary restrictions.

<athlete_information>
- Height: ${promptInputs.height}
- Weight: ${promptInputs.weight}
- Goal: ${promptInputs.goal}
- Dietary restrictions: ${promptInputs.restrictions}
</athlete_information>

Base the meal plan on the athlete information above.

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
