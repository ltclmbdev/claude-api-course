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
import {
  AddDurationToDatetimeInput,
  GetCurrentDatetimeInput,
  addDurationToDatetime,
  getCurrentDatetime,
} from './datetime.ts'
import { SetReminderInput, setReminder } from './reminders.ts'
import { TextEditorInput, runTextEditor } from './text-editor.ts'

// Tool name → our function. Each case validates Claude's input with the
// tool's Zod schema first. New tools get a new case.
// async since lesson 11: the text editor works with files.
const runTool = async (name: string, input: unknown) => {
  switch (name) {
    case 'get_current_datetime': {
      const { date_format } = GetCurrentDatetimeInput.parse(input)
      return getCurrentDatetime(date_format)
    }
    case 'add_duration_to_datetime':
      return addDurationToDatetime(AddDurationToDatetimeInput.parse(input))
    case 'set_reminder':
      return setReminder(SetReminderInput.parse(input))
    case 'str_replace_based_edit_tool':
      return runTextEditor(TextEditorInput.parse(input))
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

// One tool_result per tool_use block — Claude may ask for several tools
// in one response, and every request needs an answer, errors included.
// One after another, not in parallel: two edits of the same file in one
// response would otherwise both read the original and overwrite each other.
export const runTools = async (message: Anthropic.Message) => {
  const results: Anthropic.ToolResultBlockParam[] = []

  for (const toolUse of message.content) {
    if (toolUse.type !== 'tool_use') continue

    try {
      const output = await runTool(toolUse.name, toolUse.input)
      results.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        // Python: json.dumps(output). A plain string is sent as is.
        content: typeof output === 'string' ? output : JSON.stringify(output),
        is_error: false,
      })
    } catch (error) {
      results.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content:
          error instanceof z.ZodError
            ? z.prettifyError(error)
            : `Error: ${(error as Error).message}`,
        is_error: true,
      })
    }
  }

  return results
}

// Keeps going while Claude asks for tools; stops on its final answer.
// The course loops forever (`while True`); maxTurns is a guard against a
// conversation that never ends — each turn is a paid request.
export const runConversation = async (
  messages: Messages,
  {
    tools,
    maxTurns = 10,
    maxTokens,
  }: { tools: Anthropic.ToolUnion[]; maxTurns?: number; maxTokens?: number }
) => {
  for (let turn = 1; turn <= maxTurns; turn++) {
    const response = await sendMessage(messages, { tools, maxTokens })
    addAssistantMessage(messages, response)
    console.log(`[turn ${turn}] ${getText(response)}`)

    if (response.stop_reason !== 'tool_use') {
      return messages
    }

    addUserMessage(messages, await runTools(response))
  }

  throw new Error(`No final answer after ${maxTurns} turns`)
}
