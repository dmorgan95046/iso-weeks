/**
 * ISO-8601 week-date helpers for the JavaScript Date type.
 *
 * The key subtlety of ISO-8601 weeks is that the *week-numbering year*
 * (the year that owns weeks 1..53) is not the same thing as the calendar
 * year. A date near a year boundary can belong to the previous year's last
 * week or the next year's first week. We resolve this by first finding
 * the Thursday of the date's week, because per ISO-8601 the week-numbering
 * year is whatever calendar year that Thursday falls in. This is the most
 * robust approach: it avoids hand-coded tables and handles every boundary
 * case (Dec 29, Jan 3, leap years, week-53 years) uniformly.
 */

/**
 * Day-of-week of `d`, in ISO numbering where Monday = 1 .. Sunday = 7.
 *
 * `Date.prototype.getDay()` returns Sunday = 0 .. Saturday = 6, which makes
 * the "days since Monday" arithmetic ugly and error-prone near the wrap.
 * ISO's 1..7 is far nicer for week math.
 *
 * @param {Date} d
 * @returns {number} 1..7
 */
function isoDay(d) {
  return ((d.getDay() + 6) % 7) + 1;
}

/**
 * The Thursday of the same Monday-Sunday week as `d`.
 *
 * Thursday is the anchor for ISO-8601: whatever calendar year the Thursday
 * of a week falls in is the week-numbering year for every day of that week.
 * We choose Thursday specifically because it's never within three days of a
 * year boundary, which is exactly the ambiguity zone (Mon Dec 29 / Sun Jan 3).
 *
 * @param {Date} d
 * @returns {Date} a new Date at local midnight on that Thursday
 */
function thursdayOf(d) {
  const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return new Date(midnight.getTime() + (4 - isoDay(d)) * 86400000);
}

/**
 * The Monday that starts the ISO week containing `d`.
 *
 * @param {Date} d
 * @returns {Date} a new Date at local midnight on that Monday
 */
function mondayOf(d) {
  const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return new Date(midnight.getTime() - (isoDay(d) - 1) * 86400000);
}

/**
 * The ISO-8601 week-numbering year of `d`.
 *
 * For ~99% of days this equals the calendar year; the exceptions are the
 * first few days of January (which may belong to the previous year's
 * week 52 or 53) and the last few days of December (which may belong to
 * the next year's week 1).
 *
 * @param {Date} d
 * @returns {number} e.g. 2024
 */
export function isoYear(d) {
  return thursdayOf(d).getFullYear();
}

/**
 * The ISO-8601 week number (1..53) of `d`.
 *
 * Computed as: (difference in days between the Monday of `d`'s week and the
 * Monday of week 1 of the week-numbering year) / 7 + 1. Both Mondays are
 * derived from Thursdays, so both are anchored to the same week-numbering
 * year and the subtraction is always well-defined.
 *
 * @param {Date} d
 * @returns {number} 1..53
 */
export function isoWeek(d) {
  const y = isoYear(d);
  const jan4 = new Date(y, 0, 4); // Jan 4 is always in ISO week 1
  const week1Monday = mondayOf(jan4);
  const thisMonday = mondayOf(d);
  const diffDays = Math.round((thisMonday - week1Monday) / 86400000);
  return Math.floor(diffDays / 7) + 1;
}

/**
 * Convenience: the week-numbering year and week as a plain object.
 *
 * Some call sites want both values without paying for two `thursdayOf`
 * calls; this still does, but keeps the API tidy. If performance matters,
 * inline the Thursday logic at the call site.
 *
 * @param {Date} d
 * @returns {{ year: number, week: number }}
 */
export function isoWeekYear(d) {
  return { year: isoYear(d), week: isoWeek(d) };
}

/**
 * The date (at local midnight) of Monday of ISO week `week` in ISO year `year`.
 *
 * The rule: week 1 is the week containing January 4th. So its Monday is
 * January 4th shifted backward to its week's Monday. From that anchor,
 * week N's Monday is exactly (N-1)*7 days later.
 *
 * @param {number} year ISO week-numbering year (e.g. 2024)
 * @param {number} week 1..53
 * @returns {Date}
 */
export function fromIsoWeek(year, week) {
  const jan4 = new Date(year, 0, 4);
  const week1Monday = mondayOf(jan4);
  return new Date(week1Monday.getTime() + (week - 1) * 7 * 86400000);
}

/**
 * Number of ISO weeks in `year` (52 or 53).
 *
 * A year has 53 weeks iff January 1 is a Thursday, or (for non-leap-years)
 * January 1 is a Wednesday. Rather than encode that table, we derive it:
 * a year has 53 weeks when its December 28th — which is always in the last
 * week — has week number 53. This is a single source of truth and stays
 * correct under every calendar quirk.
 *
 * @param {number} year
 * @returns {number} 52 or 53
 */
export function weeksInIsoYear(year) {
  const dec28 = new Date(year, 11, 28);
  return isoWeek(dec28);
}

/**
 * Compact "YYYY-Www" string for `d`, matching ISO-8601 week-date shorthand.
 *
 * @param {Date} d
 * @returns {string} e.g. "2024-W06"
 */
export function toIsoWeekString(d) {
  const { year, week } = isoWeekYear(d);
  return `${year}-W${String(week).padStart(2, '0')}`;
}
