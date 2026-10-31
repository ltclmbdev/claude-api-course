/**
 * Lesson 3 — Generating test datasets
 * https://academy.claude.com/courses/building-with-the-claude-api/generating-test-datasets
 *
 * Code: src/lib/eval/dataset.ts
 * Writes lessons/02-prompt-evaluation/data/dataset.json — the next lessons
 * read it, so run this one first. Re-run to get a fresh dataset.
 *
 * Run: npm run lesson lessons/02-prompt-evaluation/03-generating-test-datasets.ts [count]
 */
import {
  DATASET_PATH,
  generateDataset,
  saveDataset,
} from '@/lib/eval/dataset.ts'

const count = Number(process.argv[2] ?? 3)

const dataset = await generateDataset(count)
console.dir(dataset, { depth: null })

await saveDataset(dataset)
console.log(`\nSaved ${dataset.length} test cases to ${DATASET_PATH}`)
