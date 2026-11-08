# 3. Prompt engineering techniques

One task through the whole module: a 1-day meal plan for an athlete. Lesson 1 sets up a naive baseline prompt; each next lesson applies one technique and re-runs the eval.

The course ships a ready-made Python `PromptEvaluator` class. Here it's two plain functions in [`src/lib/prompt-evaluator`](../../src/lib/prompt-evaluator), built on the ideas from module 2:

- `generateDataset` writes `data/dataset.json` from a task description and the prompt's inputs. Each test case has its own solution criteria.
- `runEvaluation` runs the prompt on every case (`concurrency`, default 3, replaces `max_concurrent_tasks`), grades each output with a model, and writes `data/results-<time>.json` plus `data/report-<time>.html` (both git-ignored).
- `extraCriteria` are mandatory requirements: an output that misses one scores 3 or lower.

| #   | Lesson                                                                                                                                         | Exercise                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | [Prompt engineering](https://academy.claude.com/courses/building-with-the-claude-api/prompt-engineering)                                       | [`01-prompt-engineering.ts`](./01-prompt-engineering.ts) |
| 2   | [Being clear and direct](https://academy.claude.com/courses/building-with-the-claude-api/being-clear-and-direct)                               |                                                          |
| 3   | [Being specific](https://academy.claude.com/courses/building-with-the-claude-api/being-specific)                                               |                                                          |
| 4   | [Structure with XML tags](https://academy.claude.com/courses/building-with-the-claude-api/structure-with-xml-tags)                             |                                                          |
| 5   | [Providing examples](https://academy.claude.com/courses/building-with-the-claude-api/providing-examples)                                       |                                                          |
| 6   | [Quiz on prompt engineering techniques](https://academy.claude.com/courses/building-with-the-claude-api/quiz-on-prompt-engineering-techniques) | —                                                        |
