// Lesson 8 — Implementing multiple turns
// Python: run_conversation / run_tools / run_tool
import type Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

import {
  type Messages,
  addAssistantMessage,
  addUserMessage,
  getText,
  sendMessage,
} from '../messages.ts'
import { GetCurrentDatetimeInput, getCurrentDatetime } from './datetime.ts'

// Tool name → our function. Each case validates Claude's input with the
// tool's Zod schema first. New tools get a new case.
const runTool = (name: string, input: unknown) => {
  switch (name) {
    case 'get_current_datetime': {
      const { date_format } = GetCurrentDatetimeInput.parse(input)
      return getCurrentDatetime(date_format)
    }
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

// One tool_result per tool_use block — Claude may ask for several tools
// in one response, and every request needs an answer, errors included.
export const runTools = (
  message: Anthropic.Message
): Anthropic.ToolResultBlockParam[] =>
  message.content
    .filter((block) => block.type === 'tool_use')
    .map((toolUse) => {
      try {
        const output = runTool(toolUse.name, toolUse.input)
        return {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          // Python: json.dumps(output). A plain string is sent as is.
          content: typeof output === 'string' ? output : JSON.stringify(output),
          is_error: false,
        }
      } catch (error) {
        return {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content:
            error instanceof z.ZodError
              ? z.prettifyError(error)
              : `Error: ${(error as Error).message}`,
          is_error: true,
        }
      }
    })

// Keeps going while Claude asks for tools; stops on its final answer.
// The course loops forever (`while True`); maxTurns is a guard against a
// conversation that never ends — each turn is a paid request.
export const runConversation = async (
  messages: Messages,
  { tools, maxTurns = 10 }: { tools: Anthropic.ToolUnion[]; maxTurns?: number }
) => {
  for (let turn = 1; turn <= maxTurns; turn++) {
    const response = await sendMessage(messages, { tools })
    addAssistantMessage(messages, response)
    console.log(`[turn ${turn}] ${getText(response)}`)

    if (response.stop_reason !== 'tool_use') {
      return messages
    }

    addUserMessage(messages, runTools(response))
  }

  throw new Error(`No final answer after ${maxTurns} turns`)
}
