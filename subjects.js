// subjects.js — subject data and current term.
// Each subject now has a `group` field:
//   'core'        — first 11, must be taken in sequence (approval required to deviate)
//   'compulsory'  — mandatory, any order
//   'elective'    — choose 3
// The `type` field (Compulsory/Elective) is kept for engine compatibility.

/**
 * Derive the current LPAB term ID from a date, so the planner always
 * points at the right semester without a hardcoded value to update by hand.
 *
 * LPAB runs two terms a year. A term ID names the year the term starts in
 * (see js/utils/terms.js):
 *   winterYYYY — lectures from May YYYY, exams ~early September YYYY
 *   summerYYYY — lectures from November YYYY, exams ~early March YYYY+1
 *
 * The term flips to the next one shortly after its exam period ends —
 * 15 March and 15 September are used as cutoffs, a few days past each
 * term's typical exam period (~12 Mar, ~10 Sep) and well before results
 * are published or the next term's lectures begin, without needing exact
 * dates that shift year to year.
 *
 * @param {Date} [date] — defaults to now
 * @returns {string} e.g. 'winter2026', 'summer2026'
 */
export function computeCurrentTerm(date = new Date()) {
    const year = date.getFullYear();
    const cutoffMar15 = new Date(year, 2, 15);
    const cutoffSep15 = new Date(year, 8, 15);

    if (date < cutoffMar15) return `summer${year - 1}`; // Summer term that started last November
    if (date < cutoffSep15) return `winter${year}`;
    return `summer${year}`;
}

export const currentTerm = computeCurrentTerm();

// Exam dates below are from LPAB's March 2027 exam timetable (Summer 2026/27).
// Subjects not offered this term have `exam: null`.
export const subjects = [
    // ── CORE (sequential, IDs 01–11) ──────────────────────────────────────────
    { id: '01', name: 'Foundations of Law',          group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Wednesday', exam: '9 Mar 2027, 9.00 am' },
    { id: '02', name: 'Criminal Law & Procedure',    group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: '5 Mar 2027, 9.00 am' },
    { id: '03', name: 'Torts',                       group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Monday',    exam: '10 Mar 2027, 9.00 am' },
    { id: '04', name: 'Contracts',                   group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: '8 Mar 2027, 1.45 pm' },
    { id: '05', name: 'Real Property',               group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Thursday',  exam: '11 Mar 2027, 9.00 am' },
    { id: '06', name: 'Australian Constitutional Law', group: 'core',      type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: '4 Mar 2027, 9.00 am' },
    { id: '07', name: 'Equity',                      group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Monday',    exam: '8 Mar 2027, 9.00 am' },
    { id: '08', name: 'Commercial Transactions',     group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: '5 Mar 2027, 1.45 pm' },
    { id: '09', name: 'Administrative Law',          group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Wednesday', exam: '4 Mar 2027, 1.45 pm' },
    { id: '10', name: 'Law of Associations',         group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Thursday',  exam: '10 Mar 2027, 1.45 pm' },
    { id: '11', name: 'Evidence',                    group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Monday',    exam: '9 Mar 2027, 1.45 pm' },

    // ── COMPULSORY (any order) ─────────────────────────────────────────────────
    { id: '12', name: 'Taxation & Revenue Law',      group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: '8 Mar 2027, 9.00 am' },
    { id: '13', name: 'Succession',                  group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Wednesday', exam: '4 Mar 2027, 1.45 pm' },
    { id: '14', name: 'Conveyancing',                group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Monday',    exam: '9 Mar 2027, 9.00 am' },
    { id: '15', name: 'Practice & Procedure',        group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Thursday',  exam: '5 Mar 2027, 1.45 pm' },
    { id: '17', name: 'Legal Ethics',                group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Wednesday', exam: '11 Mar 2027, 1.45 pm' },
    { id: '24', name: 'Jurisprudence',               group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Thursday',  exam: '10 Mar 2027, 1.45 pm' },

    // ── ELECTIVE (choose 3) ────────────────────────────────────────────────────
    { id: '16', name: 'Insolvency',                          group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Wednesday', exam: null },
    { id: '18', name: 'Conflict of Laws',                    group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Thursday',  exam: '5 Mar 2027, 9.00 am' },
    { id: '19', name: 'Family Law',                          group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Wednesday', exam: '11 Mar 2027, 9.00 am' },
    { id: '20', name: 'Planning & Environmental Law',        group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Thursday',  exam: null },
    { id: '21', name: 'Industrial Law',                      group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Monday',    exam: '9 Mar 2027, 9.00 am' },
    { id: '22', name: 'Intellectual Property',               group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Tuesday',   exam: null },
    { id: '23', name: 'Public International Law',            group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Thursday',  exam: null },
    { id: '25', name: 'Competition & Consumer Law',          group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Tuesday',   exam: '10 Mar 2027, 1.45 pm' },
    { id: '26', name: 'Advanced Statutory Interpretation',   group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Monday',    exam: null },
    { id: '27', name: 'Health Law',                          group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Monday',    exam: '8 Mar 2027, 1.45 pm' },
];
