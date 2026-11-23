/**
 * Lesson 6 — Sending tool results
 * https://academy.claude.com/courses/building-with-the-claude-api/sending-tool-results
 *
 * The full round trip: Claude asks for the tool, we run it and send the
 * result back as a tool_result block in a *user* message, with the
 * tool_use id it answers. Claude then writes the final answer.
 *
 * Differences from the course: the tool_use block is found by type (not
 * content[1]), and its input is validated with the Zod schema before the
 * function runs. Errors go back to Claude with is_error: true.
 *
 * Run: npm run lesson lessons/04-tool-use/06-sending-tool-results.ts
 */
import type Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

import {
  type Messages,
  addAssistantMessage,
  addUserMessage,
  getText,
  sendMessage,
} from '@/lib/messages.ts'
import {
  GetCurrentDatetimeInput,
  getCurrentDatetime,
  getCurrentDatetimeSchema,
} from '@/lib/tools/datetime.ts'

const tools = [getCurrentDatetimeSchema]

const messages: Messages = []
addUserMessage(messages, 'What is the exact time, formatted as HH:MM:SS?')

// 1. Claude asks for the tool
const response = await sendMessage(messages, { tools })
addAssistantMessage(messages, response)

const toolUse = response.content.find((block) => block.type === 'tool_use')
if (!toolUse) {
  console.log('Claude answered without the tool:', getText(response))
  process.exit()
}

// 2. We run it. Python: get_current_datetime(**response.content[1].input)
let content: string
let isError = false
try {
  const { date_format } = GetCurrentDatetimeInput.parse(toolUse.input)
  content = getCurrentDatetime(date_format)
} catch (error) {
  isError = true
  content =
    error instanceof z.ZodError
      ? z.prettifyError(error)
      : (error as Error).message
}

console.log(`[tool_use] ${toolUse.name}`, toolUse.input)
console.log(`[tool_result] ${isError ? 'error: ' : ''}${content}`)

// 3. The result goes back in a user message
const toolResult: Anthropic.ToolResultBlockParam = {
  type: 'tool_result',
  tool_use_id: toolUse.id,
  content,
  is_error: isError,
}
addUserMessage(messages, [toolResult])

// 4. Claude writes the final answer. `tools` is sent again: the history
// refers to the tool, and the API is stateless.
const final = await sendMessage(messages, { tools })
console.log(`\n[${final.stop_reason}] ${getText(final)}`)
