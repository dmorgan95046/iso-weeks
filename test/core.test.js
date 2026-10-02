import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isoYear,
  isoWeek,
  isoWeekYear,
  fromIsoWeek,
  toIsoWeekString,
  weeksInIsoYear,
} from '../src/core.js';

const D = (y, m, d) => new Date(y, m, d); // m is 0-based, matching Date

// --- Anchor cases: mid-year dates where week year == calendar year, easy weeks.
test('isoWeek for a Wednesday in early February is week 6', () => {
  assert.equal(isoWeek(D(2024, 1, 7)), 6); // Wed Feb 7 2024
  assert.equal(isoYear(D(2024, 1, 7)), 2024);
});

test('isoWeekYear bundles both values for the same date', () => {
  assert.deepEqual(isoWeekYear(D(2024, 1, 7)), { year: 2024, week: 6 });
});

// --- The canonical edge case: 2020-12-31 belongs to 2020-W53.
test('2020-12-31 (Thursday) is ISO 2020-W53', () => {
  assert.equal(isoYear(D(2020, 11, 31)), 2020);
  assert.equal(isoWeek(D(2020, 11, 31)), 53);
});

// --- 2021-01-01 (Friday) is still in 2020-W53.
test('2021-01-01 (Friday) is ISO 2020-W53', () => {
  assert.equal(isoYear(D(2021, 0, 1)), 2020);
  assert.equal(isoWeek(D(2021, 0, 1)), 53);
});

// --- 2021-01-04 (Monday) is the first day of 2021-W01.
test('2021-01-04 (Monday) starts ISO 2021-W01', () => {
  assert.equal(isoYear(D(2021, 0, 4)), 2021);
  assert.equal(isoWeek(D(2021, 0, 4)), 1);
});

// --- 2014-12-31 (Wednesday) belongs to 2015-W01 (start of next year).
test('2014-12-31 (Wednesday) is ISO 2015-W01', () => {
  assert.equal(isoYear(D(2014, 11, 31)), 2015);
  assert.equal(isoWeek(D(2014, 11, 31)), 1);
});

// --- 2015-01-01 (Thursday) is in 2015-W01.
test('2015-01-01 (Thursday) is ISO 2015-W01', () => {
  assert.equal(isoYear(D(2015, 0, 1)), 2015);
  assert.equal(isoWeek(D(2015, 0, 1)), 1);
});

// --- weeksInIsoYear: 2020 is a 53-week year, 2021 and 2022 are 52-week years.
test('2020 has 53 ISO weeks', () => {
  assert.equal(weeksInIsoYear(2020), 53);
});
test('2021 has 52 ISO weeks', () => {
  assert.equal(weeksInIsoYear(2021), 52);
});
test('2022 has 52 ISO weeks', () => {
  assert.equal(weeksInIsoYear(2022), 52);
});

// --- fromIsoWeek round-trip: the Monday of a given week should itself report that week.
test('fromIsoWeek(2020, 53) lands on a Monday reporting W53', () => {
  const m = fromIsoWeek(2020, 53);
  // Monday check (ISO day 1)
  assert.equal(((m.getDay() + 6) % 7) + 1, 1);
  assert.equal(isoYear(m), 2020);
  assert.equal(isoWeek(m), 53);
});

test('fromIsoWeek(2021, 1) lands on Monday 2021-01-04', () => {
  const m = fromIsoWeek(2021, 1);
  assert.equal(m.getFullYear(), 2021);
  assert.equal(m.getMonth(), 0);
  assert.equal(m.getDate(), 4);
});

test('fromIsoWeek / isoWeek round-trip across a 53-week year', () => {
  for (let w = 1; w <= 53; w++) {
    const m = fromIsoWeek(2020, w);
    assert.equal(isoYear(m), 2020, `week ${w} year`);
    assert.equal(isoWeek(m), w, `week ${w} number`);
  }
});

test('toIsoWeekString formats as YYYY-Www with zero-padding', () => {
  assert.equal(toIsoWeekString(D(2024, 1, 7)), '2024-W06');
  assert.equal(toIsoWeekString(D(2020, 11, 31)), '2020-W53');
  assert.equal(toIsoWeekString(D(2021, 0, 4)), '2021-W01');
});
