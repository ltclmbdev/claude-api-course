/**
 * Lesson 5 — System prompts
 * https://academy.claude.com/courses/building-with-the-claude-api/system-prompts
 *
 * Run: npm run lesson lessons/01-accessing-claude/05-system-prompts.ts
 */
import { type Messages, addUserMessage, chat } from '@/lib/messages.ts'
import { heading } from '@/lib/print.ts'

const system = `
You are a patient math tutor.
Do not directly answer a student's questions.
Guide them to a solution step by step.
`

const messages: Messages = []
addUserMessage(messages, 'How do I solve 5x + 2 = 3 for x?')

heading('Without system prompt')
console.log(await chat(messages))

heading('With system prompt')
// `chat` leaves `system` out of the request when it's undefined —
// the same thing the Python helper does with `if system:`.
console.log(await chat(messages, { system }))
