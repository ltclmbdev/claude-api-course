import type Anthropic from '@anthropic-ai/sdk'

import { client, model } from './client.ts'

// The course's add_user_message / add_assistant_message / chat helpers,
// ported to TypeScript. Kept small on purpose: later lessons extend them.

export type Messages = Anthropic.MessageParam[]

// Section 4: also takes content blocks — a tool result is sent back as a
// user message with a tool_result block.
export const addUserMessage = (
  messages: Messages,
  content: string | Anthropic.ContentBlockParam[]
) => {
  messages.push({ role: 'user', content })
}

// Section 4: also takes a whole response, so tool_use blocks stay in the
// history next to the text. Python: content=message.content
export const addAssistantMessage = (
  messages: Messages,
  message: string | Anthropic.Message
) => {
  messages.push({
    role: 'assistant',
    content: typeof message === 'string' ? message : message.content,
  })
}

// Python: message.content[0].text
// In TS `content` is a union of block types, so narrow to text blocks first.
export const getText = (message: Anthropic.Message) =>
  message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')

export type ChatOptions = {
  system?: string
  stopSequences?: string[]
  maxTokens?: number
  tools?: Anthropic.ToolUnion[]
}

// Section 4: returns the whole response — with tools, it can hold tool_use
// blocks, not just text.
export const sendMessage = (
  messages: Messages,
  { system, stopSequences, maxTokens = 1000, tools }: ChatOptions = {}
) =>
  // Python builds a params dict and skips `system` when it's None.
  // In TS an undefined property is simply left out of the JSON body.
  client.messages.create({
    model,
    max_tokens: maxTokens,
    messages,
    system,
    stop_sequences: stopSequences,
    tools,
  })

// Text-only shortcut used by the earlier lessons.
export const chat = async (messages: Messages, options?: ChatOptions) =>
  getText(await sendMessage(messages, options))
