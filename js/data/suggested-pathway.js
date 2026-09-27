/**
 * suggested-pathway.js — LPAB suggested study sequence.
 *
 * Maps 8 generic semester slots to subject IDs.
 * Elective placeholders ('elective1'–'elective3') are empty
 * droppable slots rendered by ui-board.js.
 *
 * Source: LPAB Diploma in Law — Suggested Study Sequence
 */

import { termSequence } from '../utils/terms.js';

export const SUGGESTED_PATHWAY = [
    { label: '1st Semester', subjects: ['01', '02'] },
    { label: '2nd Semester', subjects: ['03', '04'] },
    { label: '3rd Semester', subjects: ['05', '06'] },
    { label: '4th Semester', subjects: ['07', '08'] },
    { label: '5th Semester', subjects: ['09', '10', '11'] },
    { label: '6th Semester', subjects: ['12', '13'], electiveSlots: 1 },
    { label: '7th Semester', subjects: ['14', '15'], electiveSlots: 1 },
    { label: '8th Semester', subjects: ['17', '24'], electiveSlots: 1 },
];

/**
 * Generate the 8 semester term IDs starting from the given currentTerm.
 * Alternates Winter → Summer → Winter… from the starting term.
 *
 * @param {string} currentTerm  e.g. 'winter2026'
 * @returns {string[]}          e.g. ['winter2026', 'summer2026', 'winter2027', ...]
 */
export function generateTermSequence(currentTerm) {
    return termSequence(currentTerm, SUGGESTED_PATHWAY.length);
}
