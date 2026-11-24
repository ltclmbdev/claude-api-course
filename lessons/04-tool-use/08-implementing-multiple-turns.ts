/**
 * Lesson 8 — Implementing multiple turns
 * https://academy.claude.com/courses/building-with-the-claude-api/implementing-multiple-turns
 *
 * Code: src/lib/tools/conversation.ts
 *
 * The tool loop: send → if Claude asks for tools, run every tool_use and
 * send the results back → repeat until stop_reason isn't 'tool_use'.
 * (Lesson 7 explains the idea; its helper changes were done in lessons 5-6.)
 *
 * The question can be answered with one call or two (time and weekday),
 * in one response or across turns — the loop handles any of these.
 *
 * Run: npm run lesson lessons/04-tool-use/08-implementing-multiple-turns.ts
 */
import { type Messages, addUserMessage } from '@/lib/messages.ts'
import { runConversation } from '@/lib/tools/conversation.ts'
import { getCurrentDatetimeSchema } from '@/lib/tools/datetime.ts'

const messages: Messages = []
addUserMessage(
  messages,
  'What time is it now (hours and minutes), and what day of the week is it?'
)

await runConversation(messages, { tools: [getCurrentDatetimeSchema] })

// The whole history: who said what, and which blocks it contained.
console.log('\nHistory:')
for (const { role, content } of messages) {
  const blocks =
    typeof content === 'string'
      ? 'text'
      : content
          .map((block) =>
            block.type === 'tool_use'
              ? `tool_use(${block.name} ${JSON.stringify(block.input)})`
              : block.type === 'tool_result'
                ? `tool_result(${JSON.stringify(block.content)})`
                : block.type
          )
          .join(', ')
  console.log(`  ${role.padEnd(9)} ${blocks}`)
}
