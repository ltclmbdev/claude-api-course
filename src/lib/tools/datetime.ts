// Tools for the reminder project. Claude never runs these functions: it
// asks us to, and reads our result or error message. So errors should say
// what's wrong — Claude uses them to fix its arguments and retry.
import { format } from 'date-fns'

// Lesson 3. Python: get_current_datetime(date_format="%Y-%m-%d %H:%M:%S")
// Formats use date-fns tokens (yyyy-MM-dd), not strftime codes.
export const getCurrentDatetime = (dateFormat = 'yyyy-MM-dd HH:mm:ss') => {
  if (!dateFormat) {
    throw new Error('date_format cannot be empty')
  }

  // date-fns doesn't reject strftime codes: "%Y-%m-%d" silently
  // becomes "%2026-%38-%18" (m = minutes).
  if (dateFormat.includes('%')) {
    throw new Error(
      `date_format must use date-fns tokens like "yyyy-MM-dd HH:mm", not strftime codes like "%Y-%m-%d" (got "${dateFormat}")`
    )
  }

  // Other mistakes (e.g. "YYYY") throw a RangeError that already says
  // how to fix them.
  return format(new Date(), dateFormat)
}
