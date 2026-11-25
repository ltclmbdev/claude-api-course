/**
 * Lesson 10 — Fine grained tool calling
 * https://academy.claude.com/courses/building-with-the-claude-api/fine-grained-tool-calling
 *
 * Tool arguments can be streamed like text: input_json_delta events, each
 * with a partial_json chunk. By default the API holds the chunks back
 * until a whole top-level key (here `abstract`, then `meta`) is done and
 * validated — so the stream pauses, then arrives in bursts.
 * `eager_input_streaming: true` on the tool turns that off: chunks come as
 * Claude writes them, but nobody checks the JSON — that's on us.
 *
 * Compare the timing of the chunks:
 *   npm run lesson lessons/04-tool-use/10-fine-grained-tool-calling.ts
 *   npm run lesson -- lessons/04-tool-use/10-fine-grained-tool-calling.ts --eager
 *
 * Differences from the course: the raw stream (`stream: true`) instead of
 * the messages.stream() helper. The helper parses the tool input itself
 * and the whole stream fails on invalid JSON; the raw stream leaves
 * parsing to us, as the lesson recommends.
 */
import type Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

import { client, model } from '@/lib/client.ts'

const SaveArticleInput = z.object({
  abstract: z.string().describe('The article abstract'),
  meta: z.object({
    word_count: z.number().int().describe('Number of words in the abstract'),
    review: z.string().describe('A one-sentence review of the abstract'),
  }),
})

const saveArticleSchema = {
  name: 'save_article',
  description:
    'Saves an article abstract together with its metadata. ' +
    'Use it once the abstract is written.',
  input_schema: z.toJSONSchema(SaveArticleInput) as Anthropic.Tool.InputSchema,
} satisfies Anthropic.Tool

const eager = process.argv.includes('--eager')
const tool: Anthropic.Tool = eager
  ? { ...saveArticleSchema, eager_input_streaming: true }
  : saveArticleSchema

console.log(`eager_input_streaming: ${eager}\n`)

const stream = await client.messages.create({
  model,
  max_tokens: 2000,
  messages: [
    {
      role: 'user',
      content:
        'Write a 150-word abstract of an article about the history of the bicycle and save it.',
    },
  ],
  tools: [tool],
  // Force this tool, so the answer is all tool arguments.
  tool_choice: { type: 'tool', name: 'save_article' },
  stream: true,
})

// Python: chunk.partial_json, and chunk.snapshot = everything so far
const start = performance.now()
let json = ''
for await (const event of stream) {
  if (
    event.type === 'content_block_delta' &&
    event.delta.type === 'input_json_delta'
  ) {
    json += event.delta.partial_json
    const ms = Math.round(performance.now() - start)
    console.log(
      `+${ms}ms`.padStart(8),
      JSON.stringify(event.delta.partial_json)
    )
  }
}

// With eager streaming the JSON may be broken (e.g. `"word_count": undefined`),
// and even valid JSON may not match the schema — check both.
let args: unknown
try {
  args = JSON.parse(json)
} catch (error) {
  console.log('\nInvalid JSON:', (error as Error).message)
  process.exit()
}

const result = SaveArticleInput.safeParse(args)
console.log(
  result.success
    ? `\nValid arguments, ${result.data.meta.word_count} words`
    : `\nJSON doesn't match the schema:\n${z.prettifyError(result.error)}`
)
