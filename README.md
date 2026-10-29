# claude-api-course

My TypeScript exercises for [Building with the Claude API](https://academy.claude.com/courses/building-with-the-claude-api) on Claude Academy.

The course examples are in Python. Here every code lesson is a standalone TypeScript script on the official [`@anthropic-ai/sdk`](https://www.npmjs.com/package/@anthropic-ai/sdk), run with `tsx`.

## Setup

```bash
nvm use            # Node 24
npm install
cp .env.example .env   # add your ANTHROPIC_API_KEY
```

## Run a lesson

```bash
npm run lesson lessons/01-accessing-claude/03-making-a-request.ts
```

`npm run lesson` is `tsx --env-file=.env`, so any file under `lessons/` works the same way.

## Structure

```
lessons/
  01-accessing-claude/      # one folder per course module, README lists its lessons
    03-making-a-request.ts  # NN = lesson number inside the module
  ...
src/lib/
  client.ts                 # Anthropic client + model ids
  messages.ts               # addUserMessage / addAssistantMessage / chat / getText
docs/
  python-to-ts.md           # how course Python maps to the TS SDK
```

## Progress

| #   | Module                                                                    | Lessons | Status     |
| --- | ------------------------------------------------------------------------- | ------- | ---------- |
| 1   | [Accessing Claude with the API](./lessons/01-accessing-claude)            | 9       | 🟡 started |
| 2   | [Prompt evaluation](./lessons/02-prompt-evaluation)                       | 7       | ⬜         |
| 3   | [Prompt engineering techniques](./lessons/03-prompt-engineering)          | 6       | ⬜         |
| 4   | [Tool use with Claude](./lessons/04-tool-use)                             | 13      | ⬜         |
| 5   | [RAG and Agentic Search](./lessons/05-rag)                                | 7       | ⬜         |
| 6   | [Features of Claude](./lessons/06-features)                               | 9       | ⬜         |
| 7   | [Model Context Protocol](./lessons/07-mcp)                                | 11      | ⬜         |
| 8   | [Anthropic apps — Claude Code and computer use](./lessons/08-claude-code) | 4       | ⬜         |
| 9   | [Agents and workflows](./lessons/09-agents-and-workflows)                 | 8       | ⬜         |

## Where the course is out of date

SDK 1.x sends API version `2026-10-21`, and the current models (Haiku 5.5, Sonnet 5.5) changed two things the first module teaches:

- **Temperature**: `temperature`, `top_p` and `top_k` are removed. Requests with them fail with a 400 error. See [`06-temperature.ts`](./lessons/01-accessing-claude/06-temperature.ts).
- **Assistant prefill**: a `messages` array that ends with an assistant turn returns a 400 error. Use structured outputs instead. See [`08-structured-data.ts`](./lessons/01-accessing-claude/08-structured-data.ts).

The quiz still tests these concepts as the course teaches them.

## Scripts

| Script                  | What it does                            |
| ----------------------- | --------------------------------------- |
| `npm run lesson <file>` | Run a lesson with `.env` loaded         |
| `npm run typecheck`     | `tsc --noEmit` over `src` and `lessons` |
| `npm run format`        | Prettier                                |
