// Tools for the reminder project. Claude never runs these functions: it
// asks us to, and reads our result or error message. So errors should say
// what's wrong — Claude uses them to fix its arguments and retry.
import type Anthropic from '@anthropic-ai/sdk'
import { format } from 'date-fns'
import { z } from 'zod'

// Lesson 3. Python: get_current_datetime(date_format="%Y-%m-%d %H:%M:%S")
// Formats use date-fns tokens (yyyy-MM-dd), not strftime codes.
export const getCurrentDatetime = (dateFormat = 'yyyy-MM-dd HH:mm:ss') => {
  if (!dateFormat) {
    throw new Error('date_format cannot be empty')
  }

  // date-fns doesn't reject strftime codes: "%Y-%m-%d" silently
  // becomes "%2026-%38-%18" (m = minutes).
  if (dateFormat.includes('%')) {
    throw new Error(
      `date_format must use date-fns tokens like "yyyy-MM-dd HH:mm", not strftime codes like "%Y-%m-%d" (got "${dateFormat}")`
    )
  }

  // Other mistakes (e.g. "YYYY") throw a RangeError that already says
  // how to fix them.
  return format(new Date(), dateFormat)
}

// Lesson 4. Python: get_current_datetime_schema = ToolParam({...})
// Arguments are a Zod schema; the JSON Schema for Claude is generated
// from it. .describe() becomes the property's description.
export const GetCurrentDatetimeInput = z.object({
  date_format: z
    .string()
    .min(1)
    .default('yyyy-MM-dd HH:mm:ss')
    .describe(
      'Output format in date-fns tokens, NOT strftime codes: ' +
        'yyyy = year, MM = month, dd = day, HH = hour (00-23), mm = minute, ss = second, ' +
        'EEEE = weekday name, MMMM = month name. Example: "yyyy-MM-dd HH:mm".'
    ),
})
export type GetCurrentDatetimeInput = z.input<typeof GetCurrentDatetimeInput>

// `satisfies` checks the shape like Python's ToolParam, without widening
// the object's type.
export const getCurrentDatetimeSchema = {
  name: 'get_current_datetime',
  description:
    'Returns the current date and time, formatted according to the given format. ' +
    'Use it whenever an answer depends on the current date or time, or as the starting point ' +
    'for any date calculation such as "in 3 days" or "next Thursday", since you have no clock of your own. ' +
    'Returns a single string such as "2026-11-18 18:39:06".',
  // io: 'input' — describe what Claude may send, so the field with
  // .default() stays optional. `as`: TS can't tell this is type 'object'.
  input_schema: z.toJSONSchema(GetCurrentDatetimeInput, {
    io: 'input',
  }) as Anthropic.Tool.InputSchema,
} satisfies Anthropic.Tool
