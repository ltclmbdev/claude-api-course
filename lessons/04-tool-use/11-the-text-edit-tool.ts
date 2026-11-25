/**
 * Lesson 11 — The text edit tool
 * https://academy.claude.com/courses/building-with-the-claude-api/the-text-edit-tool
 *
 * Code: src/lib/tools/text-editor.ts, a case in runTool
 *
 * A built-in tool: instead of a schema we send only
 * { type: 'text_editor_20250728', name: 'str_replace_based_edit_tool' }.
 * Claude already knows its commands (view, str_replace, create, insert);
 * running them on real files is up to us.
 *
 * Claude works in lessons/04-tool-use/workspace/ (git-ignored). Each run
 * starts it over with a small main.ts.
 *
 *   npm run lesson lessons/04-tool-use/11-the-text-edit-tool.ts              # summarize main.ts
 *   npm run lesson -- lessons/04-tool-use/11-the-text-edit-tool.ts --write   # add a function + a test file
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'

import { type Messages, addUserMessage } from '@/lib/messages.ts'
import { runConversation } from '@/lib/tools/conversation.ts'
import { WORKSPACE, textEditorSchema } from '@/lib/tools/text-editor.ts'

await rm(WORKSPACE, { recursive: true, force: true })
await mkdir(WORKSPACE, { recursive: true })
await writeFile(
  `${WORKSPACE}/main.ts`,
  `export const greet = (name: string) => \`Hello, \${name}!\`

console.log(greet('world'))
`
)

const prompt = process.argv.includes('--write')
  ? 'Open the ./main.ts file and write out a function to calculate pi to the 5th digit. ' +
    'Then create a ./main.test.ts file with tests for it.'
  : 'Open the ./main.ts file and summarize its contents.'

const messages: Messages = []
addUserMessage(messages, prompt)

// Writing whole files takes more than the default 1000 output tokens.
await runConversation(messages, { tools: [textEditorSchema], maxTokens: 4000 })

console.log('\nEditor commands:')
for (const { content } of messages) {
  if (typeof content === 'string') continue
  for (const block of content) {
    if (block.type === 'tool_use') {
      const { command, path } = block.input as { command: string; path: string }
      console.log(`  ${command} ${path}`)
    }
  }
}

console.log('\nWorkspace now:', await readdir(WORKSPACE))
