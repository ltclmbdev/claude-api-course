/**
 * Lesson 5 — Handling message blocks
 * https://academy.claude.com/courses/building-with-the-claude-api/handling-message-blocks
 *
 * Code: sendMessage + addAssistantMessage in src/lib/messages.ts
 *
 * First request with a tool. Claude answers with several content blocks:
 * text, plus a tool_use block (id, name, input) asking us to run a tool.
 * The whole content goes into the history, not just the text — the next
 * lesson sends the tool result back and needs that tool_use id.
 *
 * Run: npm run lesson lessons/04-tool-use/05-handling-message-blocks.ts
 */
import {
  type Messages,
  addAssistantMessage,
  addUserMessage,
  sendMessage,
} from '@/lib/messages.ts'
import { getCurrentDatetimeSchema } from '@/lib/tools/datetime.ts'

const messages: Messages = []
addUserMessage(messages, 'What is the exact time, formatted as HH:MM:SS?')

const response = await sendMessage(messages, {
  tools: [getCurrentDatetimeSchema],
})

// 'tool_use' instead of 'end_turn': Claude stopped to wait for the result.
console.log('stop_reason:', response.stop_reason)

for (const block of response.content) {
  switch (block.type) {
    case 'text':
      console.log('\n[text]', block.text)
      break
    case 'tool_use':
      // Check input.date_format: the user asked for "HH:MM:SS", but the
      // schema told Claude to use date-fns tokens ("HH:mm:ss").
      console.log('\n[tool_use]', {
        id: block.id,
        name: block.name,
        input: block.input,
      })
      break
  }
}

addAssistantMessage(messages, response)

console.log('\nHistory:')
console.dir(messages, { depth: null })
