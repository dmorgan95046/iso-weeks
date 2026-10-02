# iso-weeks

ISO-8601 week numbers for the JavaScript `Date` — week number, week-numbering year, and the inverse lookup — with correct handling of year-boundary dates.

```js
import { isoWeek, isoYear, fromIsoWeek, toIsoWeekString, weeksInIsoYear } from 'iso-weeks';

const d = new Date(2021, 0, 1); // Fri Jan 1 2021
isoWeek(d);          // 53
isoYear(d);          // 2020  (this Friday belongs to the last week of 2020)
toIsoWeekString(d);  // "2020-W53"

fromIsoWeek(2020, 53);     // Mon Dec 28 2020 (local midnight)
weeksInIsoYear(2020);      // 53
```

## Why this exists

The ISO-8601 week calendar splits a year into weeks 1–52/53, each Monday–Sunday. The week-numbering year a date belongs to can differ from its calendar year: the first few days of January may fall in the previous year's final week, and the last days of December may fall in the next year's week 1. Hand-coded tables for this are tedious and easy to get wrong around leap years.

This library resolves every boundary case through one rule: the Thursday of a week's year is that week's week-numbering year. From that anchor, week numbers and inverse lookups fall out with no special cases. It works on plain `Date` objects in local time; it does not parse or format ISO calendar-date strings, and it does not touch time zones. If you need UTC, construct your `Date` accordingly before calling these functions.

## The awkward edge

`new Date(2021, 0, 1)` is Friday 1 January 2021, but ISO-wise it is the last day of **2020-W53**, not 2021-W01. Any naive "Jan 1 ⇒ week 1" assumption is wrong, and that is the exact case this library exists to handle.
