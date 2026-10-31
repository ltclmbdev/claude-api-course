# 2. Prompt evaluation

One eval pipeline built up across the lessons. The lesson scripts are thin entry points; the code itself lives in [`src/lib/eval`](../../src/lib/eval):

| File         | What it is                                                                 | Lesson |
| ------------ | -------------------------------------------------------------------------- | ------ |
| `dataset.ts` | Test case schema, `generateDataset`, load/save `data/dataset.json`         | 3      |
| `prompts.ts` | Prompt versions under test (`v1`, `v2`, add your own)                      | 4, 6   |
| `runner.ts`  | `runPrompt` → `runTestCase` → `runEval`, average score, results to `data/` | 4      |
| `graders.ts` | `constantGrader`, `gradeByModel`, `gradeSyntax`, `combinedGrader`          | 4–6    |

Differences from the course:

- **TypeScript instead of Python tasks.** The dataset asks for TypeScript / JSON / regex, so all three formats can be validated in Node (TypeScript compiler, `JSON.parse`, `new RegExp`).
- **Structured outputs instead of prefill.** Dataset generation and the model grader use `messages.parse` with Zod schemas. The course's ` ```json ` prefill returns a 400 on current models.
- **Test cases run 3 at a time** instead of one by one.

Run lesson 3 first: the others read the dataset it writes.

| #   | Lesson                                                                                                                 | Exercise                                                             | Done |
| --- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---- |
| 1   | [Prompt evaluation](https://academy.claude.com/courses/building-with-the-claude-api/prompt-evaluation)                 |                                                                      | ✅   |
| 2   | [A typical eval workflow](https://academy.claude.com/courses/building-with-the-claude-api/a-typical-eval-workflow)     |                                                                      | ✅   |
| 3   | [Generating test datasets](https://academy.claude.com/courses/building-with-the-claude-api/generating-test-datasets)   | [`03-generating-test-datasets.ts`](./03-generating-test-datasets.ts) | ✅   |
| 4   | [Running the eval](https://academy.claude.com/courses/building-with-the-claude-api/running-the-eval)                   | [`04-running-the-eval.ts`](./04-running-the-eval.ts)                 |      |
| 5   | [Model based grading](https://academy.claude.com/courses/building-with-the-claude-api/model-based-grading)             | [`05-model-based-grading.ts`](./05-model-based-grading.ts)           |      |
| 6   | [Code based grading](https://academy.claude.com/courses/building-with-the-claude-api/code-based-grading)               | [`06-code-based-grading.ts`](./06-code-based-grading.ts)             |      |
| 7   | [Quiz on prompt evaluation](https://academy.claude.com/courses/building-with-the-claude-api/quiz-on-prompt-evaluation) | —                                                                    |      |
