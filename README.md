# LPAB Course Planner

A lightweight, interactive drag-and-drop progression planner built specifically for the NSW Legal Profession Admission Board (LPAB) Diploma in Law.

This tool helps students map out their 20-subject progression (17 compulsory, 3 electives), tracks progress toward graduation, and automatically detects lecture and exam timetabling clashes.

**Use it online:** <https://lpabplanner.301285.xyz>. Your plan is saved in your own browser; nothing is sent to a server.

unashamedly vibe coded, because i sure as hell couldnt do it otherwise.

---

## Features

- **Drag-and-drop planner** — Drag subjects from the subject list into a semester (up to four each) or into Completed. Works with a mouse or on a touch screen
- **First-run setup** — Start from the LPAB's suggested study sequence, mark the subjects you've already completed, or pick specific subjects
- **Graduation tracker** — Progress towards 17 compulsory subjects and 3 electives, and what's still to place
- **Clash detection** — Warns when two subjects in the same semester share a lecture night. In the current semester, once its exam timetable is published, warns when two subjects share an exam time. In any other semester, flags a possible exam clash when the pair has shared an exam slot in a published timetable before
- **Core sequence warnings** — The first 11 core subjects are taken in order. A core subject placed before an earlier one is flagged until the order is fixed, since studying out of order needs LPAB approval
- **Exam statistics** — Each subject shows its recent fail rate, and each placed subject a grade breakdown, from the LPAB's published exam statistics
- **Historical exam archive** — Subjects placed in future semesters show their last known exam date from `archive.js`, and past timetables in `archive.js` drive the possible-clash warnings
- **Knows the current term** — Moves to the next semester automatically after each exam period
- **Auto-save** — Your plan is saved to `localStorage` and persists across page reloads
- **Markdown export** — **Copy plan** copies the full plan, formatted for Notion, Obsidian, or similar tools
- **Print view** — The **Print** button (or `Ctrl+P` / `Cmd+P`) hides the controls and formats the plan for A4 or PDF
- **Dark mode** — Follows your system setting by default; the ☾ / ☀ button switches it

---

## Running the App Locally

There's no build step and nothing to install: the app is plain HTML, CSS and ES6 modules.

```bash
git clone https://github.com/clancycodesbad/LPABplanner.git
cd LPABplanner
```

Because the app uses ES6 `import`/`export`, it must be served over HTTP. Opening `index.html` directly as a `file://` URL won't work. The simplest ways to serve it:

```bash
# Python (Windows: py -m http.server 8080)
python3 -m http.server 8080

# Node (if you have npx)
npx serve .
```

Then open `http://localhost:8080` in your browser.

### Running the tests

The tests use Node's built-in test runner, so there's nothing to install:

```bash
node --test quality/test_functional.mjs quality/test_regression.mjs
```

They cover the logic modules (validation, clash detection, term handling, export, saved plans). The UI is checked in a browser.

---

## Project Structure

```text
LPABplanner/
├── index.html                  ← Entry point
├── subjects.js                 ← Subject data and currentTerm (worked out from today's date)
├── archive.js                  ← Exam dates from past terms
├── engine.js                   ← Validation, clash detection, core-order checks
├── planner.js                  ← Re-export shim (backwards compatibility)
├── css/
│   └── planner.css             ← All styles and design tokens (light + dark mode)
├── fonts/                      ← Self-hosted typefaces and their licences (SIL OFL)
├── data/
│   └── stats/                  ← LPAB exam statistics, one file per exam sitting
├── js/
│   ├── data/
│   │   └── suggested-pathway.js ← LPAB's suggested study sequence
│   ├── services/
│   │   ├── plan-export.js      ← Markdown text for Copy plan
│   │   └── stats-service.js    ← Fail rates and grade breakdowns from data/stats
│   ├── state/
│   │   ├── planner-state.js    ← In-memory plan state and mutations
│   │   └── storage.js          ← localStorage read/write only
│   ├── ui/
│   │   ├── ui-main.js          ← App start-up and shared page elements
│   │   ├── ui-board.js         ← Term rows, subject tiles, drag-and-drop
│   │   ├── ui-touch-dnd.js     ← Touch drag-and-drop
│   │   ├── ui-pool.js          ← Subject list
│   │   ├── ui-progress.js      ← Progress bars and status
│   │   ├── ui-stats.js         ← Fail-rate badges and grade bars
│   │   ├── ui-onboarding.js    ← First-run setup and help tour
│   │   └── ui-toolbar.js       ← Copy plan, Reset plan, toasts
│   └── utils/
│       ├── datetime.js         ← Exam date parsing and comparison
│       └── terms.js            ← Term IDs: labels, ordering, sequences
├── quality/                    ← Tests and the Quality Playbook audit
├── CHANGELOG.md                ← Release history
└── AGENTS.md                   ← Notes for AI assistants working on the project
```

### Module responsibilities

| File | Responsibility | Imports from |
| --- | --- | --- |
| `subjects.js` | Subject list, `currentTerm` | Nothing |
| `archive.js` | Past exam dates | Nothing |
| `engine.js` | Validation, clash detection, core order | `subjects.js`, `archive.js`, `datetime.js`, `terms.js` |
| `js/state/storage.js` | localStorage only | Nothing |
| `js/state/planner-state.js` | Plan mutations, loading saved plans | `engine.js`, `subjects.js`, `storage.js`, `terms.js` |
| `js/utils/datetime.js` | Date parsing and comparison | Nothing |
| `js/utils/terms.js` | Term labels, ordering, sequences | Nothing |
| `js/services/plan-export.js` | Markdown export text | `terms.js`, `datetime.js` |
| `js/services/stats-service.js` | Exam statistics | `data/stats/index.js` |
| `js/ui/*.js` | Rendering and interaction | State, engine, services and each other |

**Rule:** data modules (`subjects.js`, `archive.js`, `data/stats/`) never import from anything, and the logic modules (`engine.js`, `js/state/`, `js/utils/`, `js/services/`) never touch the page, so they can be tested directly.

---

## Updating for a New Semester

When the LPAB releases a new Evening Lecture Schedule and Examination Timetable, only two files need to change: `subjects.js` and `archive.js`. No logic or UI code needs to be touched. When it publishes exam statistics for a sitting, add them under `data/stats/` (see `data/stats/index.js`).

Term IDs name the year a term starts: `winter2026` is May to September 2026, and `summer2026` is November 2026 to March 2027, shown on the site as "Summer 2026/27". (Exam statistics in `data/stats/` are keyed differently, by exam sitting — see `data/stats/index.js`.)

### Step 1 — Archive the outgoing semester

In `archive.js`, add an entry for the semester that just ended, with every subject that was examined that term. This preserves its exam dates so the planner can show "Last ran" information for future semesters, and lets it flag pairs of subjects that shared an exam slot as possible clashes in later semesters.

```js
// archive.js
export const historicalExams = {
    // previous terms...
    winter2026: [
        { id: '01', name: 'Foundations of Law', exam: '8 Sep 2026, 9.00 am' },
        { id: '02', name: 'Criminal Law & Procedure', exam: '4 Sep 2026, 9.00 am' },
        // ... all subjects examined this term
    ],
};
```

### Step 2 — Check `currentTerm` (no edit needed)

`currentTerm` in `subjects.js` is worked out from today's date by `computeCurrentTerm()`: it moves to the next semester on 15 March and 15 September, just after each exam period ends. You don't need to change it. Exam dates in `subjects.js` are always read as belonging to `currentTerm`.

### Step 3 — Update the subject timetable

In `subjects.js`, update each subject's `lecture` and `exam` fields from the new PDFs.

```js
{
    id: '18',
    name: 'Conflict of Laws',
    group: 'elective',
    type: 'Elective',
    terms: ['Summer'],
    lecture: 'Thursday',          // ← update from the new lecture schedule
    exam: '4 Mar 2027, 1.45 pm'   // ← update from the new exam timetable
}
```

- If a subject is **not offered** in the new term, set `exam: null`. The engine will skip it for clash detection and show its archived date instead.
- The `terms` array (`['Winter']`, `['Summer']`, or `['Winter', 'Summer']`) controls which semesters a subject can be added to. Update this if LPAB changes availability.
- Exam date format must be `'D Mon YYYY, H.MM am/pm'` (e.g., `'3 Mar 2027, 9.00 am'`). This is what `datetime.js` parses — any other format shows as "Exam date unrecognized" on the board and is left out of clash detection.
- Until the new exam timetable is published, leave every `exam` as `null`. The board shows "Last ran" dates from `archive.js`, and possible clashes are flagged from past timetables.

Then release it as a patch version (see below).

---

## Releasing a New Version

The project uses [Semantic Versioning](https://semver.org): bump **MAJOR** for changes that break saved plans or existing behaviour, **MINOR** for new features, and **PATCH** for fixes and semester data updates. Every deploy is a release:

1. Run the tests (see above).
2. Add a section to `CHANGELOG.md` for the new version, following [Keep a Changelog](https://keepachangelog.com), and a compare link at the bottom.
3. Update the version and date in the footer of `index.html` (`vX.Y.Z · Last updated ...`, including the `<time datetime>` value).
4. Commit to `testing`, then tag the commit and push both:

   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin testing --follow-tags
   ```

5. Deploy (see `AGENTS.md`), then merge `testing` into `main` with a pull request.

---

## For LLMs and Agents

Read [`AGENTS.md`](AGENTS.md) first. It covers deployment, how term IDs work, and the rules that are easy to get wrong.

---

## Disclaimer

This tool is a community project and is **not** officially affiliated with, maintained by, or endorsed by the Legal Profession Admission Board (LPAB) or the University of Sydney Law Extension Committee (LEC). Students should always cross-reference their progression plans with the official LPAB Course Information Handbook and published timetables.
