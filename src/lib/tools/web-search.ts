// Lesson 12 — The web search tool
//
// A server tool: Anthropic runs the searches itself, inside the request.
// We send only the config; there's no function or case in runTool, and
// Claude never stops with tool_use for it.
import type Anthropic from '@anthropic-ai/sdk'

// The course's version. Newer ones (web_search_20260209, _20260318) add
// dynamic filtering: Claude filters results with code before reading them.
export const webSearchSchema = {
  type: 'web_search_20250305',
  name: 'web_search',
  // Cap on searches per turn — each one is billed ($10 per 1,000).
  max_uses: 5,
} satisfies Anthropic.WebSearchTool20250305
