// ui-board.js — planner board, semester cards, subject slots, drag-and-drop
import { subjects, currentTerm } from '../../subjects.js';
import { historicalExams } from '../../archive.js';
import { parseExamDate } from '../utils/datetime.js';
import { isTermId, formatTermLabel, formatTermDates, compareTerms, termSequence } from '../utils/terms.js';
import { PlannerState } from '../../planner.js';
import { Engine, POSSIBLE_EXAM_CLASH, MAX_SUBJECTS_PER_SEMESTER } from '../../engine.js';
import { renderSubjectPool } from './ui-pool.js';
import { renderProgress } from './ui-progress.js';
import { feedbackPanel, errorListEl } from './ui-main.js';
import { createGradeBar } from './ui-stats.js';
import { initTouchDnD } from './ui-touch-dnd.js';
// Stage 3: import showToast so touch drop errors surface near the user's
// finger regardless of how far the feedback panel has scrolled off-screen.
import { showToast } from './ui-toolbar.js';

// Stage 2: detect whether the primary input is touch so we can skip the
// dblclick shortcut (which misfires as a zoom gesture on mobile).
const isTouchPrimary = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

export function getExamText(subject, semesterId) {
    if (semesterId === 'completed') return '';

    if (semesterId === currentTerm) {
        if (!subject.exam) return 'Exam TBA';
        if (!parseExamDate(subject.exam)) return `Exam date unrecognized: "${subject.exam}"`;
        return `Exam ${subject.exam}`;
    }

    let lastKnown = null;
    if (subject.exam && parseExamDate(subject.exam)) {
        lastKnown = `${subject.exam} (${formatTermLabel(currentTerm)})`;
    } else if (typeof historicalExams !== 'undefined') {
        const pastTerms = Object.keys(historicalExams).reverse();
        for (const term of pastTerms) {
            const pastSub = historicalExams[term].find(s => s.id === subject.id);
            if (pastSub && pastSub.exam && parseExamDate(pastSub.exam)) {
                lastKnown = `${pastSub.exam} (${formatTermLabel(term)})`;
                break;
            }
        }
    }
    return lastKnown ? `Last ran ${lastKnown}` : 'Exam TBA';
}

export function handleAddSubject(subject, semesterId) {
    feedbackPanel.style.display = 'none';
    errorListEl.innerHTML = '';

    // Core order warning — non-blocking
    if (semesterId !== 'completed') {
        const orderWarning = Engine.checkCoreOrder(subject.id, semesterId, PlannerState.getPlan());
        if (orderWarning) {
            feedbackPanel.style.display = 'block';
            feedbackPanel.className = 'warning';
            const li = document.createElement('li');
            li.innerHTML = `⚠️ ${orderWarning}`;
            errorListEl.appendChild(li);
        }
    }

    const result = PlannerState.addSubject(semesterId, subject);

    if (!result.success) {
        feedbackPanel.style.display = 'block';
        feedbackPanel.className = 'error';
        errorListEl.innerHTML = '';
        result.errors.forEach(err => {
            const li = document.createElement('li');
            li.innerText = err;
            errorListEl.appendChild(li);
        });
        // Stage 3: on touch devices the feedback panel is likely off-screen;
        // fire a toast so the error is visible near the top of the viewport.
        if (isTouchPrimary && result.errors.length > 0) {
            showToast(result.errors[0], true);
        }
    }

    renderPlannerBoard();
    renderSubjectPool();
}

export function renderPlannerBoard() {
    const dynamicContainer = document.getElementById('dynamic-semesters');
    const completedSection = document.getElementById('completed-slots');

    dynamicContainer.innerHTML = '';
    completedSection.innerHTML = '';

    completedSection.ondragover  = (e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); };
    completedSection.ondragleave = (e) => { e.currentTarget.classList.remove('drag-over'); };
    completedSection.ondrop      = (e) => { e.currentTarget.classList.remove('drag-over'); handleDrop(e, 'completed'); };

    const completedSubjects = PlannerState.getSemester('completed');
    if (completedSubjects.length === 0) {
        completedSection.innerHTML = `<div class="slots__empty">Drag subjects you've finished here, or double-click them in the list.</div>`;
    } else {
        completedSubjects.forEach(subject => completedSection.appendChild(createSubjectSlot(subject, 'completed', null)));
    }

    const progress = PlannerState.getProgress();
    const unassignedSubjects = Math.max(20 - progress.totalSubjects, 0);
    const extraSemestersNeeded = Math.ceil(unassignedSubjects / 3);

    // Start at the current term, or earlier if a past term still holds subjects,
    // so placements in terms that have since ended stay visible.
    const plan = PlannerState.getPlan();
    const plannedTerms = Object.keys(plan).filter(t => isTermId(t) && plan[t].length > 0);
    const firstTerm = [currentTerm, ...plannedTerms].sort(compareTerms)[0];
    const allTerms = termSequence(firstTerm, 30);

    let lastPopulatedIndex = -1;
    allTerms.forEach((term, index) => {
        if (plan[term] && plan[term].length > 0) lastPopulatedIndex = index;
    });

    const termsToRender = allTerms.slice(0, Math.max(lastPopulatedIndex + 1 + extraSemestersNeeded, 1));

    termsToRender.forEach(semesterId => {
        const plannedSubjects = PlannerState.getSemester(semesterId);
        const clashData = PlannerState.getClashes(semesterId);

        const isCurrent = semesterId === currentTerm;
        const card = document.createElement('section');
        card.className = `semester-card${isCurrent ? ' semester-card--current' : ''}`;
        card.innerHTML = `
            <div class="semester-card__label">
                <h2 class="semester-card__title">${formatTermLabel(semesterId)}</h2>
                <p class="semester-card__dates">${formatTermDates(semesterId)}</p>
                ${isCurrent ? '<p class="semester-card__now">Now</p>' : ''}
            </div>
            <div class="semester-slots" data-semester-id="${semesterId}"></div>`;
        const slotsContainer = card.querySelector('.semester-slots');

        slotsContainer.ondragover  = (e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); };
        slotsContainer.ondragleave = (e) => { e.currentTarget.classList.remove('drag-over'); };
        slotsContainer.ondrop      = (e) => { e.currentTarget.classList.remove('drag-over'); handleDrop(e, semesterId); };

        plannedSubjects.forEach(subject => {
            slotsContainer.appendChild(createSubjectSlot(subject, semesterId, clashData[subject.id]));
        });
        // Empty slots show how many of the semester's four places are left.
        for (let i = plannedSubjects.length; i < MAX_SUBJECTS_PER_SEMESTER; i++) {
            const empty = document.createElement('div');
            empty.className = 'slot-empty';
            if (plannedSubjects.length === 0 && i === 0) empty.textContent = 'Drag a subject here';
            slotsContainer.appendChild(empty);
        }

        dynamicContainer.appendChild(card);
    });

    renderProgress();
    // Re-attach touch DnD handlers after every board render
    initTouchDnD();
}

function createSubjectSlot(subject, semesterId, subjectWarnings) {
    const slot = document.createElement('div');
    const warnings = subjectWarnings || [];
    const hardClashes = warnings.filter(w => w !== POSSIBLE_EXAM_CLASH);
    const possibleClashes = warnings.filter(w => w === POSSIBLE_EXAM_CLASH);
    const orderIssues = Engine.coreOrderIssues(subject.id, semesterId, PlannerState.getPlan());
    const isCompleted = semesterId === 'completed';
    // The type stripe always shows; a warning adds its own colour on top.
    const typeClass = subject.group === 'core' ? 'slot--core' :
                      subject.type.toLowerCase() === 'compulsory' ? 'slot--compulsory' :
                                                                    'slot--elective';
    const stateClass = hardClashes.length > 0 ? ' slot--clash' :
                       possibleClashes.length > 0 || orderIssues ? ' slot--warning' : '';

    slot.className = `slot ${typeClass}${stateClass}${isCompleted ? ' slot--completed' : ''}`;
    slot.draggable = true;
    // Data attributes for touch DnD
    slot.dataset.subjectId = subject.id;
    slot.dataset.sourceId  = semesterId;

    slot.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: subject.id, source: semesterId }));
        e.dataTransfer.effectAllowed = 'move';
    };

    // Stage 2: only attach dblclick on non-touch devices to avoid triggering
    // the browser's double-tap-to-zoom gesture on mobile.
    if (!isCompleted && !isTouchPrimary) {
        slot.title = 'Double-click to mark as completed';
        slot.ondblclick = () => window.markCompleted(semesterId, subject.id);
    }

    const groupLabel = subject.group === 'core' ? 'Core' :
                       subject.group === 'compulsory' ? 'Compulsory' : 'Elective';

    // Icons are decorative: the text already says what each warning is.
    const icon = emoji => `<span aria-hidden="true">${emoji}</span>`;
    let warningsHtml = '';
    hardClashes.forEach(w => { warningsHtml += `<p class="slot__clash-warning">${icon('⚠️')} ${w}</p>`; });
    possibleClashes.forEach(w => { warningsHtml += `<p class="slot__warning-msg">${icon('⏳')} ${w}</p>`; });
    if (orderIssues) {
        const takeFirst = [...orderIssues.missing, ...orderIssues.later].join(', ');
        warningsHtml += `<p class="slot__warning-msg">${icon('⚠️')} Out of sequence — needs LPAB approval. Take first: ${takeFirst}.</p>`;
    }

    const detailsHtml = isCompleted ? '' : `
        <p class="slot__lecture">${subject.lecture} lectures</p>
        <p class="slot__exam">${getExamText(subject, semesterId)}</p>`;
    const doneBtnHtml = isCompleted ? '' :
        `<button class="action-btn slot__btn--done" aria-label="Done — move ${subject.name} to Completed" onclick="markCompleted('${semesterId}', '${subject.id}')">Done</button>`;

    slot.innerHTML = `
        <p class="slot__name">${subject.name}</p>
        <p class="slot__type">${groupLabel}</p>
        ${detailsHtml}${warningsHtml}
        <div class="slot__actions">
            ${doneBtnHtml}
            <button class="action-btn slot__btn--remove" aria-label="Remove ${subject.name}" onclick="removeSubject('${semesterId}', '${subject.id}')">Remove</button>
        </div>
    `;

    if (!isCompleted) {
        const gradeBar = createGradeBar(subject.id);
        if (gradeBar) slot.appendChild(gradeBar);
    }

    return slot;
}

/**
 * Move a subject from one semester slot to another (or from the pool).
 * Validates the target BEFORE removing from the source, so a rejected
 * move never loses the subject — it stays exactly where it was.
 */
export function attemptMove(subject, sourceId, targetId) {
    const isMove = sourceId !== 'pool' && sourceId !== targetId;
    if (isMove && targetId !== 'completed') {
        const targetList = PlannerState.getSemester(targetId);
        const errors = Engine.validateSemester(targetList, subject, targetId);
        if (errors.length > 0) {
            handleAddSubject(subject, targetId); // reuses the existing error-banner/toast UI, no removal happened
            return;
        }
    }
    if (isMove) PlannerState.removeSubject(sourceId, subject.id);
    handleAddSubject(subject, targetId);
}

function handleDrop(event, targetSemesterId) {
    event.preventDefault();
    try {
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const subject = subjects.find(s => s.id === data.id);
        if (!subject) return;
        attemptMove(subject, data.source, targetSemesterId);
    } catch (err) {
        console.error('Drop failed:', err);
    }
}

window.removeSubject = function (semesterId, subjectId) {
    PlannerState.removeSubject(semesterId, subjectId);
    renderPlannerBoard();
    renderSubjectPool();
    feedbackPanel.style.display = 'none';
};

window.markCompleted = function (semesterId, subjectId) {
    PlannerState.markCompleted(semesterId, subjectId);
    renderPlannerBoard();
    renderSubjectPool();
    feedbackPanel.style.display = 'none';
};
