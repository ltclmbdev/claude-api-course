# claude-api-course

My TypeScript exercises for [Building with the Claude API](https://academy.claude.com/courses/building-with-the-claude-api) on Claude Academy.

The course examples are in Python. Here every code lesson is a standalone TypeScript script on the official [`@anthropic-ai/sdk`](https://www.npmjs.com/package/@anthropic-ai/sdk), run with `tsx`.

## Sections

One branch per course section. Each branch starts from the previous one, and every lesson with code is one commit titled after the lesson.

| #   | Section                                                        | Branch                             |
| --- | -------------------------------------------------------------- | ---------------------------------- |
| 1   | [Accessing Claude with the API](./lessons/01-accessing-claude) | `01-accessing-claude-with-the-api` |

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
  01-accessing-claude/      # one folder per course section, README lists its lessons
    03-making-a-request.ts  # NN = lesson number inside the section
  ...
src/lib/
  client.ts                 # Anthropic client + model ids
  messages.ts               # addUserMessage / addAssistantMessage / chat / getText
docs/
  python-to-ts.md           # how course Python maps to the TS SDK
```

## Scripts

| Script                  | What it does                            |
| ----------------------- | --------------------------------------- |
| `npm run lesson <file>` | Run a lesson with `.env` loaded         |
| `npm run typecheck`     | `tsc --noEmit` over `src` and `lessons` |
| `npm run format`        | Prettier                                |
