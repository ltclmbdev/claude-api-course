import Anthropic from '@anthropic-ai/sdk'

// Reads ANTHROPIC_API_KEY from the environment (.env via `tsx --env-file`).
export const client = new Anthropic()

// The course uses "claude-sonnet-4-5". Haiku is the cheap default for drills;
// switch to `models.smart` when the output quality matters.
export const models = {
  dev: 'claude-haiku-5-5',
  smart: 'claude-sonnet-5-5',
} as const

export const model = models.dev
