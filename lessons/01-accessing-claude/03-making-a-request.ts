/**
 * Lesson 3 — Making a request
 * https://academy.claude.com/courses/building-with-the-claude-api/making-a-request
 *
 * Run: npm run lesson lessons/01-accessing-claude/03-making-a-request.ts
 */
import Anthropic from '@anthropic-ai/sdk'

// Python: client = Anthropic()  — the key comes from ANTHROPIC_API_KEY
const client = new Anthropic()
const model = 'claude-haiku-5-5'

// Python keyword arguments become a single params object.
// max_tokens is a safety cap, not a target length.
const message = await client.messages.create({
  model,
  max_tokens: 1000,
  messages: [
    {
      role: 'user',
      content: 'What is quantum computing? Answer in one sentence',
    },
  ],
})

// The whole response object: id, model, content blocks, stop_reason, usage...
console.dir(message, { depth: null })

// Python: message.content[0].text
// `content` is a union of block types, so TS makes you check the type.
const [first] = message.content
if (first?.type === 'text') {
  console.log('\nText:', first.text)
}

console.log('Stop reason:', message.stop_reason)
console.log('Usage:', message.usage)
