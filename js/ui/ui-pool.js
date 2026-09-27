// ui-pool.js — renders the subject pool sidebar, respecting hidden subjects.
import { subjects } from '../../subjects.js';
import { PlannerState } from '../../planner.js';
import { handleAddSubject } from './ui-board.js';
import { createDifficultyBadge } from './ui-stats.js';
import { initTouchDnD } from './ui-touch-dnd.js';

// Stage 2: detect whether the primary input is touch so we can skip the
// dblclick shortcut (which misfires as a zoom gesture on mobile).
const isTouchPrimary = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

const subjectListEl = document.getElementById('subject-list');

export function renderSubjectPool() {
    subjectListEl.innerHTML = '';
    const currentProgress = PlannerState.getProgress();
    const hiddenIds = PlannerState.getHidden();

    const planned  = currentProgress.totalSubjectsList.map(s => s.id);
    const visible  = subjects.filter(s => !planned.includes(s.id) && !hiddenIds.includes(s.id));
    const hidden   = subjects.filter(s => !planned.includes(s.id) &&  hiddenIds.includes(s.id));

    if (visible.length === 0 && hidden.length === 0) {
        subjectListEl.innerHTML = '<p class="pool-empty">Every subject is in your plan.</p>';
        return;
    }

    // subjects.js lists core, then compulsory, then electives.
    const groupHeadings = { core: 'Core, in order', compulsory: 'Compulsory', elective: 'Electives, choose 3' };
    let lastGroup = null;
    visible.forEach(subject => {
        if (subject.group !== lastGroup) {
            const heading = document.createElement('h3');
            heading.className = 'pool-group';
            heading.textContent = groupHeadings[subject.group];
            subjectListEl.appendChild(heading);
            lastGroup = subject.group;
        }
        subjectListEl.appendChild(createPoolItem(subject));
    });

    // Hidden subjects collapsible
    if (hidden.length > 0) {
        const details = document.createElement('details');
        details.className = 'pool-hidden-section';
        details.innerHTML = `<summary class="pool-hidden-summary">Hidden subjects (${hidden.length})</summary>`;
        hidden.forEach(subject => {
            const item = createPoolItem(subject, true);
            const restoreBtn = document.createElement('button');
            restoreBtn.className = 'pool-restore-btn';
            restoreBtn.textContent = 'Restore';
            restoreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                PlannerState.restoreSubject(subject.id);
                renderSubjectPool();
            });
            item.appendChild(restoreBtn);
            details.appendChild(item);
        });
        subjectListEl.appendChild(details);
    }

    // Re-attach touch DnD handlers after pool render
    initTouchDnD();
}

function createPoolItem(subject, isHidden = false) {
    const div = document.createElement('div');
    const sType = subject.type.toLowerCase();
    const groupClass = subject.group === 'core' ? 'pool-item--core' :
                       sType === 'compulsory'    ? 'pool-item--compulsory' :
                                                   'pool-item--elective';

    div.className = `subject-item ${groupClass}${isHidden ? ' pool-item--hidden' : ''}`;
    div.draggable = !isHidden;
    // Data attributes for touch DnD
    div.dataset.subjectId = subject.id;
    div.dataset.sourceId  = 'pool';

    if (!isHidden) {
        div.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({ id: subject.id, source: 'pool' }));
            e.dataTransfer.effectAllowed = 'move';
        };
        // Stage 2: only attach dblclick on non-touch devices to avoid triggering
        // the browser's double-tap-to-zoom gesture on mobile.
        if (!isTouchPrimary) {
            div.title    = 'Drag to a semester, or double-click to mark as completed';
            div.ondblclick = () => handleAddSubject(subject, 'completed');
        }
    }

    // Header row: number and name left, fail-rate badge right
    const header = document.createElement('div');
    header.className = 'subject-item__header';

    const nameEl = document.createElement('p');
    nameEl.className = 'subject-item__name';
    nameEl.innerHTML = `<span class="subject-item__id">${subject.id}</span> ${subject.name}`;
    header.appendChild(nameEl);

    const badge = createDifficultyBadge(subject.id);
    if (badge) header.appendChild(badge);

    div.appendChild(header);

    // Most subjects run in both terms, so only a single-term subject says which.
    const meta = document.createElement('p');
    meta.className = 'subject-meta';
    const onlyTerm = subject.terms.length === 1 ? `, ${subject.terms[0].toLowerCase()} only` : '';
    meta.textContent = `${subject.lecture} lectures${onlyTerm}`;
    div.appendChild(meta);

    return div;
}
