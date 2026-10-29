/**
 * Lesson 4 — Multi-turn conversations
 * https://academy.claude.com/courses/building-with-the-claude-api/multi-turn-conversations
 *
 * The API is stateless: every request must carry the whole history.
 *
 * Run: npm run lesson lessons/01-accessing-claude/04-multi-turn-conversations.ts
 */
import {
  type Messages,
  addAssistantMessage,
  addUserMessage,
  chat,
} from '@/lib/messages.ts'

const messages: Messages = []

addUserMessage(messages, 'Define quantum computing in one sentence')

const answer = await chat(messages)
console.log('Claude:', answer)

// Without this line the follow-up below has no context at all.
addAssistantMessage(messages, answer)

addUserMessage(messages, 'Write another sentence')

const finalAnswer = await chat(messages)
console.log('Claude:', finalAnswer)

console.log('\nHistory sent on the last request:')
console.dir(messages, { depth: null })
