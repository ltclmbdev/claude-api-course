// Lesson 11 — The text edit tool
//
// An Anthropic-defined tool: the API knows its schema, so we only send a
// type + name, not an input_schema. Claude still asks *us* to run it —
// the file operations below are ours to implement.
//
// The course picks the version by model (text_editor_20250124 for
// claude-3, text_editor_20250728 for newer ones). Our models are all
// newer, so it's fixed.
import type Anthropic from '@anthropic-ai/sdk'
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { z } from 'zod'

export const textEditorSchema = {
  type: 'text_editor_20250728',
  name: 'str_replace_based_edit_tool',
} satisfies Anthropic.ToolTextEditor20250728

// The input shape from the docs. A discriminated union on `command`:
// each command has its own arguments.
export const TextEditorInput = z.discriminatedUnion('command', [
  z.object({
    command: z.literal('view'),
    path: z.string(),
    // [start, end], 1-indexed; end = -1 means "to the end of the file"
    view_range: z.tuple([z.number().int(), z.number().int()]).optional(),
  }),
  z.object({
    command: z.literal('str_replace'),
    path: z.string(),
    old_str: z.string(),
    new_str: z.string(),
  }),
  z.object({
    command: z.literal('create'),
    path: z.string(),
    file_text: z.string(),
  }),
  z.object({
    command: z.literal('insert'),
    path: z.string(),
    insert_line: z.number().int().min(0), // 0 = start of the file
    insert_text: z.string(),
  }),
])
type TextEditorInput = z.output<typeof TextEditorInput>

// The folder Claude works in (git-ignored; the lesson re-creates it).
export const WORKSPACE = join(
  import.meta.dirname,
  '../../../lessons/04-tool-use/workspace'
)

// Claude decides which paths to touch, so every path is resolved inside
// the workspace; "../" or absolute paths that leave it are rejected.
const resolveInWorkspace = (path: string) => {
  const absolute = resolve(WORKSPACE, path)
  const fromWorkspace = relative(WORKSPACE, absolute)
  if (fromWorkspace.startsWith('..') || isAbsolute(fromWorkspace)) {
    throw new Error(`Path is outside the workspace: ${path}`)
  }
  return absolute
}

// "1: first line" — line numbers let Claude use view_range and insert_line.
const withLineNumbers = (lines: string[], firstLine: number) =>
  lines.map((line, index) => `${firstLine + index}: ${line}`).join('\n')

const view = async (file: string, viewRange: [number, number] | undefined) => {
  if ((await stat(file)).isDirectory()) {
    const entries = await readdir(file, { withFileTypes: true })
    return entries
      .map((entry) => (entry.isDirectory() ? `${entry.name}/` : entry.name))
      .join('\n')
  }

  const lines = (await readFile(file, 'utf8')).split('\n')
  const [start, end] = viewRange ?? [1, -1]
  return withLineNumbers(
    lines.slice(start - 1, end === -1 ? undefined : end),
    start
  )
}

const strReplace = async (file: string, oldStr: string, newStr: string) => {
  const text = await readFile(file, 'utf8')
  const count = text.split(oldStr).length - 1
  // Error texts from Anthropic's docs for this tool.
  if (count === 0) {
    throw new Error(
      'No match found for replacement. Please check your text and try again.'
    )
  }
  if (count > 1) {
    throw new Error(
      `Found ${count} matches for replacement text. Please provide more context to make a unique match.`
    )
  }
  await writeFile(
    file,
    text.replace(oldStr, () => newStr)
  )
  return 'Successfully replaced text at exactly one location.'
}

const create = async (file: string, text: string) => {
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, text)
  return 'File created successfully.'
}

const insert = async (file: string, line: number, text: string) => {
  const lines = (await readFile(file, 'utf8')).split('\n')
  if (line > lines.length) {
    throw new Error(
      `insert_line ${line} is past the end of the file (${lines.length} lines)`
    )
  }
  lines.splice(line, 0, ...text.split('\n'))
  await writeFile(file, lines.join('\n'))
  return `Text inserted after line ${line}.`
}

const run = (file: string, input: TextEditorInput) => {
  switch (input.command) {
    case 'view':
      return view(file, input.view_range)
    case 'str_replace':
      return strReplace(file, input.old_str, input.new_str)
    case 'create':
      return create(file, input.file_text)
    case 'insert':
      return insert(file, input.insert_line, input.insert_text)
  }
}

export const runTextEditor = async (input: TextEditorInput) => {
  const file = resolveInWorkspace(input.path)
  try {
    return await run(file, input)
  } catch (error) {
    // Node's message would show Claude the absolute path on our machine.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`File not found: ${input.path}`)
    }
    throw error
  }
}
