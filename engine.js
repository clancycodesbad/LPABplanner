import { examTimesClash } from './js/utils/datetime.js';
import { subjects as allSubjects } from './subjects.js';
import { historicalExams } from './archive.js';

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
     * Check whether a core subject is being placed out of sequence.
     * Returns a warning string if so, or null if order is fine.
     *
     * A subject is "out of order" if it is placed in any semester and
     * a core subject with a lower sequence number has not yet been added
     * to the plan (completed or otherwise).
     *
     * This is a warning only — the placement is not blocked.
     *
     * @param {string} subjectId
     * @param {object} currentPlan  — full plan object
     * @returns {string|null}
     */
    checkCoreOrder(subjectId, currentPlan) {
        const coreIdx = CORE_ORDER.indexOf(subjectId);
        if (coreIdx <= 0) return null; // not a core subject, or first in sequence

        const allPlanned = Object.values(currentPlan).flat().map(s => s.id);
        const missingPrior = CORE_ORDER
            .slice(0, coreIdx)
            .filter(id => !allPlanned.includes(id));

        if (missingPrior.length === 0) return null;

        const missingNames = missingPrior.map(id => {
            const s = allSubjects.find(sub => sub.id === id);
            return s ? s.name : id;
        });

        return `Taking this subject out of the recommended sequence requires LPAB approval. ` +
               `Prerequisite(s) not yet in plan: ${missingNames.join(', ')}.`;
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
