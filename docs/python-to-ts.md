# Python → TypeScript cheat sheet

| Course (Python)                                                     | Here (TypeScript)                                                     |
| ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `%pip install anthropic python-dotenv`                              | `npm i @anthropic-ai/sdk` — env comes from `tsx --env-file=.env`      |
| `client = Anthropic()`                                              | `const client = new Anthropic()`                                      |
| `client.messages.create(model=..., max_tokens=..., messages=[...])` | `await client.messages.create({ model, max_tokens, messages })`       |
| `message.content[0].text`                                           | narrow first: `block.type === 'text' && block.text` (see `getText`)   |
| `{"role": "user", "content": "..."}`                                | `{ role: 'user', content: '...' }` typed as `Anthropic.MessageParam`  |
| `if system: params["system"] = system`                              | pass `system` as-is; `undefined` is left out of the request           |
| `create(..., stream=True)` + `for event in stream`                  | `create({ ..., stream: true })` + `for await (const event of stream)` |
| `with client.messages.stream(...) as s: for t in s.text_stream`     | `const s = client.messages.stream({...}); s.on('text', (t) => ...)`   |
| `stream.get_final_message()`                                        | `await stream.finalMessage()`                                         |
| `json.loads(text.strip())`                                          | `JSON.parse(text.trim())`, or better `client.messages.parse` + Zod    |
| Tool schema dict                                                    | JSON Schema object — write it in Zod, convert with `z.toJSONSchema()` |
| `mcp` package                                                       | `@modelcontextprotocol/sdk`                                           |

## Habits

- Read the Python, close it, write the TS from memory, then compare.
- Long lessons can go through Claude Code for a first translation, but read every line of the result.
- After the streaming and tool-use lessons, move them into Next.js: a streaming route handler and a small chat UI.
