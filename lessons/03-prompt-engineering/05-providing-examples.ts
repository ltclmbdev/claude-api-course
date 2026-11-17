/**
 * Lesson 5 — Providing examples
 * https://academy.claude.com/courses/building-with-the-claude-api/providing-examples
 *
 * Technique: show Claude an input and the ideal output for it.
 *   - one-shot = one example, multi-shot = several covering different cases
 *   - most useful for corner cases, complex output formats, a target
 *     style or tone, and ambiguous inputs
 *   - wrap examples in tags (<sample_input>, <ideal_output>) so they don't
 *     blend into the instructions
 *   - say *why* the ideal output is good, not just what it is
 *
 * Where to get examples: the course suggests taking outputs that scored
 * 10 (or the best you have) from your own eval runs — open a
 * data/report-*.html and copy the top-scoring case. The one below is
 * written by hand for an athlete that isn't in the dataset, so the eval
 * doesn't grade a case the prompt has already seen the answer to.
 *
 * Run: npm run lesson lessons/03-prompt-engineering/05-providing-examples.ts
 */
import { type Messages, addUserMessage, chat } from '@/lib/messages.ts'
import type { PromptInputs } from '@/lib/prompt-evaluator/index.ts'

import { evaluateMealPlanPrompt } from './meal-plan.ts'

const example = `
<sample_input>
- Height: 178 cm
- Weight: 75 kg
- Goal: Maintain weight and energy through a soccer season
- Dietary restrictions: Lactose intolerant
</sample_input>

<ideal_output>
Daily total: ~2,900 kcal
Macros: protein 165 g · carbohydrates 350 g · fat 90 g

07:30 Breakfast — 100 g rolled oats, 300 ml lactose-free milk, 120 g banana, 20 g peanut butter
10:30 Snack — 80 g whole-grain bread, 60 g turkey breast, 100 g cucumber
13:00 Lunch — 150 g chicken breast, 250 g cooked rice, 150 g mixed vegetables, 10 ml olive oil
16:30 Pre-training — 150 g apple, 40 g oat bar
19:30 Dinner — 150 g salmon, 300 g boiled potatoes, 150 g broccoli, 10 ml olive oil
21:30 Evening snack — 200 g lactose-free yogurt, 30 g almonds
</ideal_output>

This example is good because it opens with the calorie total and macros,
gives every meal a time, lists each food with a portion in grams, fits the
athlete's goal and avoids lactose, and stays compact.
`

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

Here is an example of a sample input and an ideal output:
${example}
`

  const messages: Messages = []
  addUserMessage(messages, prompt)
  return chat(messages)
}

await evaluateMealPlanPrompt(runPrompt)
