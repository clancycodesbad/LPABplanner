/**
 * plan-export.js — builds the Markdown text for the "Copy to Text" button.
 * Pure: no DOM or storage access, so it can be tested directly.
 */

import { isTermId, formatTermLabel, compareTerms } from '../utils/terms.js';
import { parseExamDate } from '../utils/datetime.js';

/**
 * @param {object} plan         — plan object from PlannerState.getPlan()
 * @param {string} currentTerm  — e.g. 'summer2026'
 * @returns {string}
 */
export function formatPlanMarkdown(plan, currentTerm) {
    let text = '# LPAB Course Plan\n\n';

    const completed = plan['completed'] || [];
    if (completed.length) {
        text += '## Completed\n';
        completed.forEach(s => { text += `- ${s.id}: ${s.name}\n`; });
        text += '\n';
    }

    // The board creates an empty entry for every semester it shows, so only
    // semesters with subjects in them are exported.
    const plannedTerms = Object.keys(plan).filter(term => isTermId(term) && plan[term].length > 0);
    plannedTerms.sort(compareTerms).forEach(term => {
        text += `## ${formatTermLabel(term)}\n`;
        (plan[term] || []).forEach(s => {
            // Exam dates in subjects.js belong to the current term only.
            const showExam = term === currentTerm && s.exam && parseExamDate(s.exam);
            text += `- ${s.id}: ${s.name} (${s.lecture}${showExam ? ', Exam: ' + s.exam : ''})\n`;
        });
        text += '\n';
    });

    return text;
}
