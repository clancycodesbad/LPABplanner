import { examTimesClash } from './js/utils/datetime.js';
import { subjects as allSubjects } from './subjects.js';
import { historicalExams } from './archive.js';
import { isTermId, compareTerms } from './js/utils/terms.js';

// IDs of the 11 core subjects, in required sequence.
const CORE_ORDER = ['01','02','03','04','05','06','07','08','09','10','11'];

// Advisory (not a confirmed clash): the pair has clashed in a published timetable before.
export const POSSIBLE_EXAM_CLASH = 'Possible exam clash — these subjects have clashed before. Check the timetable once published.';

export const Engine = {
    isAvailableInTerm(subject, termId) {
        if (termId === 'completed') return true;
        const isWinter = termId.toLowerCase().includes('winter');
        const termString = isWinter ? 'winter' : 'summer';
        return subject.terms.some(term => term.toLowerCase() === termString);
    },

    validateSemester(selectedList, newSubject, termId) {
        const errors = [];

        if (!this.isAvailableInTerm(newSubject, termId)) {
            const termName = termId.toLowerCase().includes('winter') ? 'Winter' : 'Summer';
            errors.push(`${newSubject.name} is not offered in ${termName}.`);
        }

        if (selectedList.length >= 4) {
            errors.push('Maximum of 4 subjects per semester exceeded.');
        }

        return errors;
    },

    /**
     * Find the earlier core subjects that a core subject placed in
     * `semesterId` is out of sequence with. A prerequisite is satisfied when
     * it is completed or placed in the same or an earlier semester — the
     * LPAB's suggested pathway takes consecutive core subjects together
     * (01 with 02, 03 with 04), so the same semester is in order.
     *
     * @param {string} subjectId
     * @param {string} semesterId  — term ID the subject is (or is being) placed in
     * @param {object} plan        — full plan object
     * @returns {{ missing: string[], later: string[] }|null}
     *   names of prerequisites not in the plan / planned for a later
     *   semester, or null if the placement is in sequence
     */
    coreOrderIssues(subjectId, semesterId, plan) {
        const coreIdx = CORE_ORDER.indexOf(subjectId);
        // Not core, first in sequence, or being marked completed.
        if (coreIdx <= 0 || !isTermId(semesterId)) return null;

        const placedIn = {};
        for (const [term, list] of Object.entries(plan)) {
            if (term === 'completed' || isTermId(term)) list.forEach(s => { placedIn[s.id] = term; });
        }
        const nameOf = id => allSubjects.find(s => s.id === id)?.name ?? id;

        const missing = [];
        const later = [];
        for (const id of CORE_ORDER.slice(0, coreIdx)) {
            const term = placedIn[id];
            if (!term) missing.push(nameOf(id));
            else if (term !== 'completed' && compareTerms(term, semesterId) > 0) later.push(nameOf(id));
        }
        return missing.length || later.length ? { missing, later } : null;
    },

    /**
     * Warning text for a core subject placed out of sequence, or null if it
     * is in order. This is a warning only — the placement is not blocked.
     */
    checkCoreOrder(subjectId, semesterId, plan) {
        const issues = this.coreOrderIssues(subjectId, semesterId, plan);
        if (!issues) return null;

        const details = [];
        if (issues.missing.length) details.push(`Not yet in your plan: ${issues.missing.join(', ')}.`);
        if (issues.later.length) details.push(`Planned for a later semester: ${issues.later.join(', ')}.`);
        return `Taking this subject out of the recommended sequence requires LPAB approval. ${details.join(' ')}`;
    },

    /**
     * Check whether two subjects shared an exam date-time within any single
     * archived term. LPAB assigns exam slots deliberately per term, so a pair
     * that has clashed before is a real (if unconfirmed) risk for a term whose
     * timetable isn't published yet. Dates are only ever compared within the
     * same term — never across terms.
     */
    haveClashedHistorically(id1, id2) {
        return Object.values(historicalExams).some(termSubjects => {
            const sub1 = termSubjects.find(s => s.id === id1);
            const sub2 = termSubjects.find(s => s.id === id2);
            return sub1 && sub2 && examTimesClash(sub1.exam, sub2.exam);
        });
    },

    /**
     * Exam dates in subjects.js belong to the current term only, so they can
     * confirm a clash only in that term. For any other term (or the current
     * term before its timetable is published), a pair that clashes in the
     * current timetable or in an archived term is flagged as a possible clash.
     */
    getClashingSubjects(semesterList, semesterId, currentTerm) {
        const clashData = {};
        const addWarning = (id, message) => {
            if (!clashData[id]) clashData[id] = [];
            if (!clashData[id].includes(message)) clashData[id].push(message);
        };
        const isCurrentTerm = semesterId === currentTerm;

        for (let i = 0; i < semesterList.length; i++) {
            for (let j = i + 1; j < semesterList.length; j++) {
                const s1 = semesterList[i];
                const s2 = semesterList[j];

                if (s1.lecture === s2.lecture) {
                    addWarning(s1.id, `Lecture clash on ${s1.lecture}`);
                    addWarning(s2.id, `Lecture clash on ${s2.lecture}`);
                }

                const timetablePublished = isCurrentTerm && s1.exam && s2.exam;
                if (timetablePublished) {
                    if (examTimesClash(s1.exam, s2.exam)) {
                        addWarning(s1.id, `Exam clash on ${s1.exam}`);
                        addWarning(s2.id, `Exam clash on ${s2.exam}`);
                    }
                } else if (examTimesClash(s1.exam, s2.exam) || this.haveClashedHistorically(s1.id, s2.id)) {
                    addWarning(s1.id, POSSIBLE_EXAM_CLASH);
                    addWarning(s2.id, POSSIBLE_EXAM_CLASH);
                }
            }
        }
        return clashData;
    },

    calculateProgress(entirePlanObject) {
        const allSelected = [];
        Object.values(entirePlanObject).forEach(arr => allSelected.push(...arr));

        const compulsoryCount = allSelected.filter(s => s.type.toLowerCase() === 'compulsory').length;
        const electiveCount   = allSelected.filter(s => s.type.toLowerCase() === 'elective').length;

        return {
            compulsory: { current: compulsoryCount, required: 17 },
            electives:  { current: electiveCount,   required: 3  },
            readyToGraduate: compulsoryCount === 17 && electiveCount >= 3,
            totalSubjects: allSelected.length,
            totalSubjectsList: allSelected
        };
    }
};
