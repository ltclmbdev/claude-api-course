// Lesson 9. Python: set_reminder(content, timestamp)
// The course only prints the reminder; here it's also kept in memory, so
// a lesson can show what was set.
import type Anthropic from '@anthropic-ai/sdk'
import { isValid, parseISO } from 'date-fns'
import { z } from 'zod'

export const SetReminderInput = z.object({
  content: z.string().min(1).describe('What to remind the user about'),
  // Checked with date-fns rather than z.iso.datetime(): that one turns into
  // a huge regex in the JSON Schema, sent to Claude with every request.
  timestamp: z
    .string()
    .refine((value) => isValid(parseISO(value)), {
      message: 'timestamp must be an ISO 8601 date and time',
    })
    .describe(
      'When to send the reminder, as an ISO 8601 date and time, e.g. "2050-06-27T09:00:00"'
    ),
})

export const reminders: z.output<typeof SetReminderInput>[] = []

export const setReminder = (reminder: z.output<typeof SetReminderInput>) => {
  reminders.push(reminder)
  console.log(`---- Reminder for ${reminder.timestamp}: ${reminder.content}`)
  return `Reminder set for ${reminder.timestamp}`
}

export const setReminderSchema = {
  name: 'set_reminder',
  description:
    'Saves a reminder that will be sent to the user at the given date and time. ' +
    'Use it when the user asks to be reminded about something. ' +
    'It needs an exact timestamp: work it out first with the date tools if the user ' +
    'gives a relative date ("in 3 days", "next Friday"). Returns a confirmation.',
  input_schema: z.toJSONSchema(SetReminderInput, {
    io: 'input',
  }) as Anthropic.Tool.InputSchema,
} satisfies Anthropic.Tool
