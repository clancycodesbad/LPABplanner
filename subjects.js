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

// Exam dates below are null pending LPAB's March 2027 exam timetable, which is
// published closer to the exam period (5–12 Mar 2027 per the Summer 2026/27
// term calendar). Update each subject's `exam` field once the timetable is out.
export const subjects = [
    // ── CORE (sequential, IDs 01–11) ──────────────────────────────────────────
    { id: '01', name: 'Foundations of Law',          group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Wednesday', exam: null },
    { id: '02', name: 'Criminal Law & Procedure',    group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: null },
    { id: '03', name: 'Torts',                       group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Monday',    exam: null },
    { id: '04', name: 'Contracts',                   group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: null },
    { id: '05', name: 'Real Property',               group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Thursday',  exam: null },
    { id: '06', name: 'Australian Constitutional Law', group: 'core',      type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: null },
    { id: '07', name: 'Equity',                      group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Monday',    exam: null },
    { id: '08', name: 'Commercial Transactions',     group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: null },
    { id: '09', name: 'Administrative Law',          group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Wednesday', exam: null },
    { id: '10', name: 'Law of Associations',         group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Thursday',  exam: null },
    { id: '11', name: 'Evidence',                    group: 'core',        type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Monday',    exam: null },

    // ── COMPULSORY (any order) ─────────────────────────────────────────────────
    { id: '12', name: 'Taxation & Revenue Law',      group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Tuesday',   exam: null },
    { id: '13', name: 'Succession',                  group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Wednesday', exam: null },
    { id: '14', name: 'Conveyancing',                group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Monday',    exam: null },
    { id: '15', name: 'Practice & Procedure',        group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Thursday',  exam: null },
    { id: '17', name: 'Legal Ethics',                group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Wednesday', exam: null },
    { id: '24', name: 'Jurisprudence',               group: 'compulsory',  type: 'Compulsory', terms: ['Winter', 'Summer'], lecture: 'Thursday',  exam: null },

    // ── ELECTIVE (choose 3) ────────────────────────────────────────────────────
    { id: '16', name: 'Insolvency',                          group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Wednesday', exam: null },
    { id: '18', name: 'Conflict of Laws',                    group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Thursday',  exam: null },
    { id: '19', name: 'Family Law',                          group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Wednesday', exam: null },
    { id: '20', name: 'Planning & Environmental Law',        group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Thursday',  exam: null },
    { id: '21', name: 'Industrial Law',                      group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Monday',    exam: null },
    { id: '22', name: 'Intellectual Property',               group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Tuesday',   exam: null },
    { id: '23', name: 'Public International Law',            group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Thursday',  exam: null },
    { id: '25', name: 'Competition & Consumer Law',          group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Tuesday',   exam: null },
    { id: '26', name: 'Advanced Statutory Interpretation',   group: 'elective', type: 'Elective', terms: ['Winter'],           lecture: 'Monday',    exam: null },
    { id: '27', name: 'Health Law',                          group: 'elective', type: 'Elective', terms: ['Summer'],           lecture: 'Monday',    exam: null },
];
