import type Anthropic from '@anthropic-ai/sdk'

import { client, model } from './client.ts'

// The course's add_user_message / add_assistant_message / chat helpers,
// ported to TypeScript. Kept small on purpose: later lessons extend them.

export type Messages = Anthropic.MessageParam[]

export const addUserMessage = (messages: Messages, text: string) => {
  messages.push({ role: 'user', content: text })
}

export const addAssistantMessage = (messages: Messages, text: string) => {
  messages.push({ role: 'assistant', content: text })
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
}

export const chat = async (
  messages: Messages,
  { system, stopSequences, maxTokens = 1000 }: ChatOptions = {}
) => {
  // Python builds a params dict and skips `system` when it's None.
  // In TS an undefined property is simply left out of the JSON body.
  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    messages,
    system,
    stop_sequences: stopSequences,
  })

  return getText(message)
}
