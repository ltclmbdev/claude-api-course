/**
 * Lesson 4 — Tool schemas
 * https://academy.claude.com/courses/building-with-the-claude-api/tool-schemas
 *
 * Code: src/lib/tools/datetime.ts
 *
 * A tool schema (name + description + JSON Schema of the arguments) is all
 * Claude knows about a tool. Unlike the course, the JSON Schema is
 * generated from Zod instead of written by hand.
 *
 * Run: npm run lesson lessons/04-tool-use/04-tool-schemas.ts
 */
import { getCurrentDatetimeSchema } from '@/lib/tools/datetime.ts'

// What goes into the `tools` array of a request.
console.log(JSON.stringify(getCurrentDatetimeSchema, null, 2))
