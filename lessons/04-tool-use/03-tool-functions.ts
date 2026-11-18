/**
 * Lesson 3 — Tool functions
 * https://academy.claude.com/courses/building-with-the-claude-api/tool-functions
 *
 * Code: src/lib/tools/datetime.ts
 *
 * The section builds a reminder system. Claude doesn't know the current
 * time, so its first tool returns it. No API calls yet.
 *
 * Run: npm run lesson lessons/04-tool-use/03-tool-functions.ts
 */
import { getCurrentDatetime } from '@/lib/tools/datetime.ts'

console.log(`default            → ${getCurrentDatetime()}`)

for (const format of ['HH:mm', 'EEEE, d MMMM yyyy']) {
  console.log(`${format.padEnd(18)} → ${getCurrentDatetime(format)}`)
}

for (const badFormat of ['', '%Y-%m-%d', 'YYYY-MM-DD']) {
  try {
    getCurrentDatetime(badFormat)
  } catch (error) {
    console.log(`\nError for "${badFormat}":\n  ${(error as Error).message}`)
  }
}
