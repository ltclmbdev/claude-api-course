/**
 * Lesson 8 — Structured data
 * https://academy.claude.com/courses/building-with-the-claude-api/structured-data
 *
 * ⚠️ The course technique (assistant prefill "```json" + stop sequence "```")
 * returns a 400 on current models: a `messages` array may no longer end
 * with an assistant turn. Learn it for the quiz, but use one of these:
 *
 *   A) Stop sequence + an instruction in the user turn (closest to the course)
 *   B) Structured outputs: `output_config.format` with a Zod schema — the
 *      API guarantees the JSON matches the schema. Use this in real code.
 *
 * Run: npm run lesson lessons/01-accessing-claude/08-structured-data.ts
 */
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'

import { client, model } from '@/lib/client.ts'
import { type Messages, addUserMessage, chat } from '@/lib/messages.ts'
import { heading } from '@/lib/print.ts'

// What the course does (400 on Haiku/Sonnet 5.5):
//   addUserMessage(messages, 'Generate a very short event bridge rule as json')
//   addAssistantMessage(messages, '```json')
//   const text = await chat(messages, { stopSequences: ['```'] })

heading('A) Instruction + stop sequence')
{
  const messages: Messages = []
  addUserMessage(
    messages,
    'Generate a very short event bridge rule as json. ' +
      'Start your reply with ```json and output nothing after the JSON.'
  )

  // Not a bare '```': the reply *opens* with ```json, so generation would stop
  // at the very first token. The course avoided that by prefilling the fence.
  const text = await chat(messages, { stopSequences: ['```\n', '``` '] })
  // Python: json.loads(text.strip())
  const json = text.replace(/^```json/, '').trim()
  console.log(JSON.parse(json))
}

heading('B) Structured outputs with Zod')
{
  const EventBridgeRule = z.object({
    name: z.string(),
    description: z.string(),
    eventPattern: z.object({
      source: z.array(z.string()),
      'detail-type': z.array(z.string()),
    }),
  })

  const message = await client.messages.parse({
    model,
    max_tokens: 1000,
    messages: [
      { role: 'user', content: 'Generate a very short event bridge rule' },
    ],
    output_config: { format: zodOutputFormat(EventBridgeRule) },
  })

  // Typed as z.infer<typeof EventBridgeRule> | null
  const rule = message.parsed_output
  console.log(rule)
  console.log('Sources:', rule?.eventPattern.source)
}
