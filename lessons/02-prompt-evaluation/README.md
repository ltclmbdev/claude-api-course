# 2. Prompt evaluation

One eval pipeline, built up lesson by lesson. The code lives in [`src/lib/eval`](../../src/lib/eval); the lesson scripts are entry points. Each lesson is added in its own commit, so its diff shows exactly what the lesson adds.

| File         | What it is                                                                                                                         | Lesson |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `dataset.ts` | Test case schema, `generateDataset`, load/save `data/dataset.json`                                                                 | 3      |
| `runner.ts`  | `runPrompt` → `runTestCase` → `runEval`, `averageScore`; `saveResults` writes each run to `data/results-<time>.json` (git-ignored) | 4–6    |
| `graders.ts` | `gradeByModel`: Claude scores an output 1–10 with reasoning; `gradeSyntax`: does the output parse as TypeScript / JSON / regex     | 5, 6   |

Differences from the course:

- **TypeScript instead of Python tasks.** The dataset asks for TypeScript / JSON / regex, so all three formats are validated in Node: TypeScript compiler, `JSON.parse`, `new RegExp`.
- **Structured outputs instead of prefill.** Dataset generation and the model grader use `messages.parse` with a Zod schema. The course's ` ```json ` prefill returns a 400 on current models.
- **No ` ```code ` prefill in lesson 6.** Same 400; the prompt rules alone have to keep the output free of fences and prose. Fenced output scores 0 on syntax.

| #   | Lesson                                                                                                                 | Exercise                                                             | Done |
| --- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---- |
| 1   | [Prompt evaluation](https://academy.claude.com/courses/building-with-the-claude-api/prompt-evaluation)                 |                                                                      | ✅   |
| 2   | [A typical eval workflow](https://academy.claude.com/courses/building-with-the-claude-api/a-typical-eval-workflow)     |                                                                      | ✅   |
| 3   | [Generating test datasets](https://academy.claude.com/courses/building-with-the-claude-api/generating-test-datasets)   | [`03-generating-test-datasets.ts`](./03-generating-test-datasets.ts) | ✅   |
| 4   | [Running the eval](https://academy.claude.com/courses/building-with-the-claude-api/running-the-eval)                   | [`04-running-the-eval.ts`](./04-running-the-eval.ts)                 |      |
| 5   | [Model based grading](https://academy.claude.com/courses/building-with-the-claude-api/model-based-grading)             | [`05-model-based-grading.ts`](./05-model-based-grading.ts)           |      |
| 6   | [Code based grading](https://academy.claude.com/courses/building-with-the-claude-api/code-based-grading)               | [`06-code-based-grading.ts`](./06-code-based-grading.ts)             |      |
| 7   | [Quiz on prompt evaluation](https://academy.claude.com/courses/building-with-the-claude-api/quiz-on-prompt-evaluation) | —                                                                    |      |
