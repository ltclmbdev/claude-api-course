/**
 * Lesson 7 — Response streaming
 * https://academy.claude.com/courses/building-with-the-claude-api/response-streaming
 *
 * Run: npm run lesson lessons/01-accessing-claude/07-response-streaming.ts
 */
import { client, model } from '@/lib/client.ts'
import { type Messages, addUserMessage } from '@/lib/messages.ts'
import { heading } from '@/lib/print.ts'

const messages: Messages = []
addUserMessage(messages, 'Write a 1 sentence description of a fake database')

// 1) Raw events — Python: create(..., stream=True); for event in stream
heading('Raw events')
const raw = await client.messages.create({
  model,
  max_tokens: 1000,
  messages,
  stream: true,
})

for await (const event of raw) {
  // message_start → content_block_start → content_block_delta... →
  // content_block_stop → message_delta → message_stop
  console.log(
    event.type,
    event.type === 'content_block_delta' ? event.delta : ''
  )
}

// 2) The helper — Python: with client.messages.stream(...) as stream:
//                              for text in stream.text_stream
heading('Text only')
const stream = client.messages.stream({ model, max_tokens: 1000, messages })

stream.on('text', (delta) => {
  // In a Next.js route handler this is where you'd enqueue the chunk
  // into a ReadableStream for the browser.
  process.stdout.write(delta)
})

// Python: stream.get_final_message() — the assembled message, e.g. to store in a DB
const finalMessage = await stream.finalMessage()
console.log('\n\nFinal message usage:', finalMessage.usage)
