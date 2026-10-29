/**
 * Lesson 6 — Temperature
 * https://academy.claude.com/courses/building-with-the-claude-api/temperature
 *
 * ⚠️ The course code no longer works as written.
 *
 * API version 2026-10-21 (sent by @anthropic-ai/sdk 1.x) removed
 * `temperature`, `top_p` and `top_k`: a request that includes them gets a 400,
 * and the SDK types reject them at compile time. Current models
 * (Haiku 5.5, Sonnet 5.5, ...) always sample with the default (1.0).
 *
 * Still learn the concept — the quiz asks about it:
 *   - low (≈0)   → predictable: facts, extraction, classification
 *   - medium     → summaries, problem solving
 *   - high (≈1)  → brainstorming, creative writing
 * Temperature changes the *probability* of varied output, it never
 * guarantees it.
 *
 * What replaces it today: steer variety with the prompt itself.
 *
 * Run: npm run lesson lessons/01-accessing-claude/06-temperature.ts
 */
import { type Messages, addUserMessage, chat } from '@/lib/messages.ts'
import { heading } from '@/lib/print.ts'

// What the course does (won't compile on SDK 1.x — uncomment to see the error):
// await client.messages.create({ model, max_tokens: 100, messages, temperature: 0 })

const ask = async (prompt: string, runs = 3) => {
  for (let i = 1; i <= runs; i++) {
    const messages: Messages = []
    addUserMessage(messages, prompt)
    console.log(`${i}.`, await chat(messages, { maxTokens: 100 }))
  }
}

heading('"Low temperature" — ask for the single most likely answer')
await ask(
  'Name one movie genre. Reply with the single most common genre, one word only.'
)

heading('"High temperature" — ask for variety explicitly')
await ask(
  'Invent an unusual, surprising movie genre. Reply with the genre name only.'
)
