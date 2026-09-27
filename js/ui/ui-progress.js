// ui-progress.js — progress bar and graduation status
import { PlannerState } from '../../planner.js';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function renderProgress() {
    const progress = PlannerState.getProgress();
    const { compulsory, electives } = progress;
    const compPercent = Math.min((compulsory.current / compulsory.required) * 100, 100);
    const elecPercent = Math.min((electives.current / electives.required) * 100, 100);

    document.getElementById('compulsory-text').innerText = `${compulsory.current} of ${compulsory.required}`;
    document.getElementById('elective-text').innerText = `${electives.current} of ${electives.required}`;
    document.getElementById('compulsory-bar').style.width = `${compPercent}%`;
    document.getElementById('elective-bar').style.width = `${elecPercent}%`;

    const statusEl = document.getElementById('grad-status');
    statusEl.classList.toggle('grad-status--ready', progress.readyToGraduate);
    if (progress.readyToGraduate) {
        statusEl.innerText = 'Every subject you need to graduate is in your plan.';
        return;
    }
    const left = [];
    const compLeft = Math.max(compulsory.required - compulsory.current, 0);
    const elecLeft = Math.max(electives.required - electives.current, 0);
    if (compLeft) left.push(plural(compLeft, 'compulsory subject'));
    if (elecLeft) left.push(plural(elecLeft, 'elective'));
    statusEl.innerText = `${left.join(' and ')} still to place.`;
}
