# LPABplanner

A client-only static web app (plain HTML/CSS/ES6 modules, no backend, no build step, zero dependencies) — a drag-and-drop course planner for the NSW Legal Profession Admission Board (LPAB) Diploma in Law. Maps a 20-subject progression (17 compulsory + 3 electives), tracks graduation progress, detects lecture/exam timetable clashes, autosaves to `localStorage`, and supports markdown export and a print view.

Because the app uses native ES6 `import`/`export`, it must be served over HTTP — it will not work opened directly as a `file://` URL. Serve it with `python3 -m http.server 8080` or `npx serve .`, then open `http://localhost:8080`.

## Releases and deployment

- Every release follows Semantic Versioning: bump the version and date in `index.html`'s footer, add a `CHANGELOG.md` entry and tag the commit `vX.Y.Z` (see README "Releasing a New Version").
- The maintainer's deployment details live in `.local/DEPLOYMENT.md`, which is gitignored. Read it before deploying. Keep server names, domains and paths out of committed files.
- If the repo is served directly as a web root, block dot-files, `quality/` and `.md` files from being served.

## Structure

- `index.html` — entry point
- `subjects.js` — subject data and `currentTerm`, which is computed from today's date by `computeCurrentTerm()`; never hardcode it
- `archive.js` — historical exam dates by semester; also drives possible-clash warnings
- `engine.js` — validation and clash-detection logic
- `planner.js` — re-export shim only; never add logic here
- `css/planner.css` — all styles, light/dark tokens; the design intent is summarised at the top of the file
- `fonts/` — self-hosted Libre Caslon Text and Atkinson Hyperlegible Next, with their SIL OFL licences
- `js/state/` — `planner-state.js` (in-memory plan + mutations), `storage.js` (localStorage boundary)
- `js/utils/datetime.js` — exam-date parsing/formatting
- `js/utils/terms.js` — term IDs: display labels, chronological ordering, term sequences
- `js/services/stats-service.js` — historical exam-statistics derivation
- `js/services/plan-export.js` — Markdown text for "Copy plan" (pure, testable)
- `js/data/suggested-pathway.js` — hardcoded LPAB-recommended sequence
- `js/ui/*.js` — rendering, native + touch drag-and-drop, onboarding, toolbar
- `data/stats/*.js` — per-term exam statistics (hand-maintained)

## Easy to get wrong

- **Term IDs name the year a term starts.** `summer2026` is the term from November 2026 to March 2027, and terms run `winter2026` → `summer2026` → `winter2027`. It's shown as "Summer 2026/27" everywhere; winter terms show one year. Use `js/utils/terms.js` for labels, ordering and sequences — never format or sort term IDs by hand. `data/stats/` keys follow a different rule (`summer2026` there is the March 2026 exam sitting); never mix the two.

- **Two drag-and-drop implementations** exist: native HTML5 DnD in `ui-board.js` (mouse) and a custom pointer-event implementation in `ui-touch-dnd.js` (touch). Both move subjects through the shared `attemptMove()` in `ui-board.js`, which validates the target before removing from the source. Keep move logic there, not in either handler.
- **`subjects.js`/`archive.js` are updated by hand twice a year** from the published LPAB PDFs (see README's "Updating for a New Semester"). Exam-date strings must match `'D Mon YYYY, H.MM am/pm'` exactly — `js/utils/datetime.js`'s parser is strict and any format drift must be paired with a parser update.
- **Exam dates in `subjects.js` belong to the current term only.** A matching exam time is a confirmed clash only in `currentTerm` once its timetable is published. Everywhere else, a pair that has shared an exam slot in a published timetable is flagged as a possible clash (`POSSIBLE_EXAM_CLASH` in `engine.js`). Never compare exam dates across terms: LPAB assigns slots deliberately per term.
- **Saved plans store a copy of each subject.** `planner-state.js` swaps each one for the live `subjects.js` entry on load, so data changes reach existing plans. Don't read subject details from the saved plan without going through that.
- **Drop areas carry `data-semester-id`**, which touch drag-and-drop reads. Never derive a semester ID from heading text — the labels are for display ("Summer 2026/27").
- **Red and amber mean status only** (clash, warning). Subject type is shown by the tile's stripe and its label, never by red or amber. Check any new colour pairing against WCAG AA in both themes.
- **`planner.js` is a re-export shim** — it only re-exports `PlannerState` from `js/state/planner-state.js`. Never add logic to it.

## Quality Docs

A Quality Playbook run (v1.5.6) was completed on 2026-09-26, with a full three-reviewer spec audit reconciled on 2026-09-27. See `quality/` for the full requirements, contracts, quality constitution, functional/regression tests, and bug report. Key entry points:

- `quality/BUGS.md` — 5 confirmed bugs (4 HIGH, 1 MEDIUM), all fixed on 2026-09-27, each with a regression test.
- `quality/REQUIREMENTS.md` — 21 derived requirements across 8 use cases.
- `quality/QUALITY.md` — quality constitution with 4 fitness-to-purpose scenarios grounded in this codebase.
- `quality/spec_audits/2026-09-27-triage.md` — the three-reviewer reconciliation. Its two open specification questions (core-order temporal checks, semester-ID validation) were settled in 1.4.0; see `quality/BUGS.md`.
- Run the functional/regression test suites: `node --test quality/test_functional.mjs quality/test_regression.mjs` (Node's built-in test runner — no install needed).
