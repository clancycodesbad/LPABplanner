/**
 * terms.js — plan term IDs: display labels, ordering and sequences.
 *
 * A plan term ID names the calendar year the term starts in:
 *   winterYYYY — May to September YYYY (exams in September YYYY)
 *   summerYYYY — November YYYY to March YYYY+1 (exams in March YYYY+1)
 * so terms run winter2026, summer2026, winter2027, summer2027, ...
 *
 * data/stats/ keys follow a different rule (summerYYYY is the March YYYY
 * exam sitting) and must not be passed to these helpers.
 */

const TERM_ID = /^(winter|summer)(\d{4})$/;

function parseTerm(termId) {
    const match = TERM_ID.exec(termId);
    if (!match) throw new Error(`Not a term ID: "${termId}"`);
    return { season: match[1], year: parseInt(match[2], 10) };
}

export function isTermId(value) {
    return TERM_ID.test(value);
}

/**
 * 'winter2026' → 'Winter 2026', 'summer2026' → 'Summer 2026/27'.
 * Summer terms span two years, so both are shown, matching LPAB's naming.
 */
export function formatTermLabel(termId) {
    const { season, year } = parseTerm(termId);
    if (season === 'winter') return `Winter ${year}`;
    return `Summer ${year}/${String(year + 1).slice(-2)}`;
}

/** Sort comparator: chronological order (winter2026 < summer2026 < winter2027). */
export function compareTerms(a, b) {
    const rank = termId => {
        const { season, year } = parseTerm(termId);
        return year * 2 + (season === 'summer' ? 1 : 0);
    };
    return rank(a) - rank(b);
}

/** `count` consecutive term IDs, starting with `startTerm`. */
export function termSequence(startTerm, count) {
    let { season, year } = parseTerm(startTerm);
    const terms = [];
    for (let i = 0; i < count; i++) {
        terms.push(`${season}${year}`);
        if (season === 'summer') year++;
        season = season === 'winter' ? 'summer' : 'winter';
    }
    return terms;
}
