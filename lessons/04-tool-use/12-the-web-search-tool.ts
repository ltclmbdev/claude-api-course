/**
 * Lesson 12 — The web search tool
 * https://academy.claude.com/courses/building-with-the-claude-api/the-web-search-tool
 *
 * Code: src/lib/tools/web-search.ts, pause_turn in runConversation
 *
 * Claude searches on its own; the response then holds, in order:
 *   text                    — what Claude is about to do
 *   server_tool_use         — the query it searched for
 *   web_search_tool_result  — the results (title, url, page age)
 *   text with citations     — the answer, each claim linked to a source
 *
 * --nih limits results to nih.gov (allowed_domains), as in the course:
 *   npm run lesson lessons/04-tool-use/12-the-web-search-tool.ts
 *   npm run lesson -- lessons/04-tool-use/12-the-web-search-tool.ts --nih
 */
import type Anthropic from '@anthropic-ai/sdk'

import { type Messages, addUserMessage } from '@/lib/messages.ts'
import { runConversation } from '@/lib/tools/conversation.ts'
import { webSearchSchema } from '@/lib/tools/web-search.ts'

const tool: Anthropic.WebSearchTool20250305 = process.argv.includes('--nih')
  ? { ...webSearchSchema, allowed_domains: ['nih.gov'] }
  : webSearchSchema

const messages: Messages = []
addUserMessage(
  messages,
  'What are the best exercises for building leg muscle strength, according to scientific research?'
)

await runConversation(messages, { tools: [tool], maxTokens: 4000 })

// How the course suggests showing it: sources first, then the answer with
// numbered citations, then the citation list.
const sources: string[] = []
const citations: string[] = []
let answer = ''
let previousType = ''

for (const { role, content } of messages) {
  if (role !== 'assistant' || typeof content === 'string') continue

  for (const block of content) {
    if (block.type === 'server_tool_use') {
      console.log(`[search] ${JSON.stringify(block.input)}`)
    }

    if (block.type === 'web_search_tool_result') {
      // On an error, content is one error object instead of a list.
      if (!Array.isArray(block.content)) {
        console.log(`[search error] ${block.content.error_code}`)
        continue
      }
      for (const result of block.content) {
        sources.push(`${result.title} — ${result.url}`)
      }
    }

    if (block.type === 'text') {
      // Text blocks of one answer follow each other; a search in between
      // starts a new paragraph.
      if (answer && previousType !== 'text') answer += '\n\n'
      answer += block.text
      for (const citation of block.citations ?? []) {
        if (citation.type !== 'web_search_result_location') continue
        citations.push(`"${citation.cited_text}" — ${citation.url}`)
        answer += `[${citations.length}]`
      }
    }

    previousType = block.type
  }
}

console.log('\nSources:')
sources.forEach((source) => console.log(`  - ${source}`))
console.log(`\nAnswer:\n${answer}`)
console.log('\nCitations:')
citations.forEach((citation, i) => console.log(`  [${i + 1}] ${citation}`))
