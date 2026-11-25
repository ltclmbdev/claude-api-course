/**
 * Lesson 9 — Using multiple tools
 * https://academy.claude.com/courses/building-with-the-claude-api/using-multiple-tools
 *
 * Code: addDurationToDatetime in src/lib/tools/datetime.ts,
 *       setReminder in src/lib/tools/reminders.ts,
 *       two new cases in runTool (src/lib/tools/conversation.ts)
 *
 * Adding a tool = function + schema + its schema in `tools` + a case in
 * runTool. The loop from lesson 8 doesn't change.
 *
 * Expected: Claude calls add_duration_to_datetime, then set_reminder
 * with the date it got back.
 *
 * Run: npm run lesson lessons/04-tool-use/09-using-multiple-tools.ts
 */
import { type Messages, addUserMessage } from '@/lib/messages.ts'
import { runConversation } from '@/lib/tools/conversation.ts'
import {
  addDurationToDatetimeSchema,
  getCurrentDatetimeSchema,
} from '@/lib/tools/datetime.ts'
import { reminders, setReminderSchema } from '@/lib/tools/reminders.ts'

const messages: Messages = []
addUserMessage(
  messages,
  "Set a reminder for my doctor's appointment. It's 177 days after Jan 1st, 2050."
)

await runConversation(messages, {
  tools: [
    getCurrentDatetimeSchema,
    addDurationToDatetimeSchema,
    setReminderSchema,
  ],
})

console.log('\nTools called:')
for (const { content } of messages) {
  if (typeof content === 'string') continue
  for (const block of content) {
    if (block.type === 'tool_use') {
      console.log(`  ${block.name} ${JSON.stringify(block.input)}`)
    }
  }
}

console.log('\nReminders:', reminders)
