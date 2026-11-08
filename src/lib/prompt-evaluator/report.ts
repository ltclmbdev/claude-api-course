// The HTML report: one row per test case — inputs, output, score and the
// grader's reasoning — to see at a glance what to fix in the prompt next.
import type { EvaluationResult } from './index.ts'

const escapeHtml = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const scoreClass = (score: number) =>
  score >= 8 ? 'high' : score >= 5 ? 'medium' : 'low'

const list = (items: string[]) =>
  `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`

export const renderReport = (
  results: EvaluationResult[],
  averageScore: number
) => {
  const passed = results.filter(({ score }) => score >= 7).length

  const rows = results
    .map(
      ({ testCase, output, score, reasoning, strengths, weaknesses }) => `
      <tr>
        <td>
          <p class="scenario">${escapeHtml(testCase.scenario)}</p>
          <dl>${Object.entries(testCase.promptInputs)
            .map(
              ([key, value]) =>
                `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`
            )
            .join('')}</dl>
          <h4>Solution criteria</h4>
          ${list(testCase.solutionCriteria)}
        </td>
        <td><pre>${escapeHtml(output)}</pre></td>
        <td class="score ${scoreClass(score)}">${score}</td>
        <td>
          <p>${escapeHtml(reasoning)}</p>
          <h4>Strengths</h4>${list(strengths)}
          <h4>Weaknesses</h4>${list(weaknesses)}
        </td>
      </tr>`
    )
    .join('')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Prompt evaluation report</title>
<style>
  body { font: 14px/1.5 system-ui, sans-serif; margin: 2rem; color: #222; }
  .summary { display: flex; gap: 2rem; margin-bottom: 1.5rem; }
  .summary div { background: #f4f4f5; padding: .75rem 1rem; border-radius: 8px; }
  .summary strong { display: block; font-size: 1.5rem; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ddd; padding: .75rem; vertical-align: top; text-align: left; }
  th { background: #f4f4f5; }
  pre { white-space: pre-wrap; margin: 0; max-height: 32rem; overflow: auto; }
  .scenario { font-weight: 600; margin-top: 0; }
  dt { font-weight: 600; } dd { margin: 0 0 .5rem; }
  h4 { margin: .75rem 0 .25rem; }
  ul { margin: 0; padding-left: 1.25rem; }
  .score { font-size: 1.5rem; font-weight: 700; text-align: center; }
  .high { background: #dcfce7; } .medium { background: #fef9c3; } .low { background: #fee2e2; }
</style>
</head>
<body>
<h1>Prompt evaluation report</h1>
<div class="summary">
  <div>Test cases<strong>${results.length}</strong></div>
  <div>Average score<strong>${averageScore.toFixed(1)}</strong></div>
  <div>Pass rate (score ≥ 7)<strong>${Math.round((passed / results.length) * 100)}%</strong></div>
</div>
<table>
  <thead><tr><th>Test case</th><th>Output</th><th>Score</th><th>Grader</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
</body>
</html>
`
}
