# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html): MAJOR for changes that break saved plans or existing behaviour, MINOR for new features, PATCH for fixes and semester data updates.

## [1.3.1] - 2026-09-27

### Fixed

- Markdown export showed the current term's exam date under every semester. Exam dates now appear only in the current term, and unparseable dates are left out.

## [1.3.0] - 2026-09-27

### Added

- **Automatic term rollover** — `currentTerm` is computed from today's date, moving to the next semester on 15 March and 15 September, so it no longer needs editing each semester.
- **Possible exam clash warnings** — outside the current term (or before its timetable is published), a pair of subjects that shared an exam slot in a published timetable is flagged in amber as a possible clash.
- **Version and last-updated marker** at the foot of the board, with a link to the source on GitHub.
- Quality Playbook audit under `quality/`, with functional and regression tests (`node --test quality/test_functional.mjs quality/test_regression.mjs`).

### Changed

- Rolled over to Summer 2026/27. Winter 2026 exam dates moved to `archive.js`; Summer 2026/27 exam dates stay unset until LPAB publishes the March 2027 timetable.
- Summer terms are labelled with both years, matching LPAB (for example "Summer 2026/27"), across the board, onboarding, export, "Last ran" dates and exam statistics.
- The board starts at the current term instead of a fixed Winter 2026. Earlier terms still holding subjects stay visible.

### Fixed

- Dragging a subject onto a full semester no longer removes it from its original semester (mouse and touch).
- Saved plans now pick up current exam dates and lecture nights instead of keeping the data from when each subject was placed.
- Exam dates that can't be parsed show "Exam date unrecognized" instead of looking valid while being ignored by clash detection.
- Markdown export lists semesters chronologically instead of alphabetically.
- Subjects that onboarding can't place are reported in a toast instead of being dropped silently.

## [1.2.1] - 2026-04-27

### Changed

- Mobile toolbar header restructured to the progress-header layout, with inline styles removed.

### Fixed

- Mobile CSS fixes: touch-action, narrow breakpoint, subject pool scroll hint, pathway preview.
- Touch drag-and-drop hardened; double-click to mark completed is mouse-only, avoiding double-tap zoom.
- Failed touch drops show a toast near the user's finger.

## [1.2.0] - 2026-04-26

### Added

- Mobile responsive layout and touch drag-and-drop.
- September (Winter) 2025 exam statistics.

### Fixed

- Onboarding: subject list scrolls independently so the header and buttons stay visible, and the action footer stays fixed when the list is long.
- Onboarding wizard showing twice, duplicate imports and element IDs left by a merge.

## [1.1.0] - 2026-04-26

### Added

- First-run onboarding wizard with three paths: follow the suggested pathway, mark completed subjects, or pick subjects to include. The Help button opens a separate tile tour.
- Historical exam statistics (Summer 2023 to Winter 2024) with v1/v2 grading-scheme normalisation, did-not-sit counted as fail, stats badges in the subject pool and grade bars on board slots.
- Reset modal, hidden subjects and a core-order advisory warning.

## [1.0.0] - 2026-04-26

### Added

- **Dark mode** — Full light/dark theme support via CSS custom properties. Respects `prefers-color-scheme` on load; manual 🌙/☀️ toggle in the toolbar overrides it. No JavaScript repaints — the entire palette swaps through a single `data-theme` attribute on `<html>`. ([`246f160`](https://github.com/clancycodesbad/LPABplanner/commit/246f160015eeda43615294932efb686dfe83ba95))
- **`js/utils/datetime.js`** — New date utility module. Parses the exam date string format (`'8 Sep 2026, 9.00 am'`) into native `Date` objects. Exports `parseExamDate`, `formatExamDate`, `examTimesClash`, and `sortByExamDate`. All functions are null-safe for subjects with no exam. ([`fa7b05e`](https://github.com/clancycodesbad/LPABplanner/commit/fa7b05e9a73680b0a97983938a24ce6ec842045f))

### Changed

- **UI split** — Monolithic `ui.js` broken into five focused modules under `js/ui/`: `ui-board.js`, `ui-pool.js`, `ui-progress.js`, `ui-toolbar.js`, `ui-main.js`. Each module owns one concern and can be changed without touching the others. Legacy `ui.js` deleted. ([`14f81fc`](https://github.com/clancycodesbad/LPABplanner/commit/14f81fc2b664658483a56aa8dee92a36e13a88a9), [`9948d48`](https://github.com/clancycodesbad/LPABplanner/commit/9948d48fdc7a623c8355be49e1e8cb0de3a0bbca))
- **State split** — `planner.js` split into `js/state/storage.js` (localStorage read/write only) and `js/state/planner-state.js` (plan mutations, delegates to storage and engine). `planner.js` retained as a re-export shim so no existing import paths needed changing. `_plan` is now a private module variable — external mutation is no longer possible. ([`381a00a`](https://github.com/clancycodesbad/LPABplanner/commit/381a00a91a6ef09ffb6a746d3bfe5477efa5007c))
- **CSS tokens** — All hardcoded inline colours removed from JavaScript. Clash state, subject type colours, drag-over highlight, and button colours are now CSS classes (`slot--clash`, `slot--compulsory`, `slot--elective`, `drag-over`). All values defined as custom properties in `css/planner.css`. All inline `<style>` removed from `index.html`. ([`1b30917`](https://github.com/clancycodesbad/LPABplanner/commit/1b30917a5c46c309cef34c1e2a9c1553504f57ff))
- **Exam clash detection** — `engine.js` now uses `examTimesClash()` from `datetime.js` instead of a raw string comparison (`s1.exam === s2.exam`). Null exams are handled internally; the guard clauses in the engine are removed. ([`9a18f78`](https://github.com/clancycodesbad/LPABplanner/commit/9a18f7832b750c74dc3fbeabbb8679801ab850ff))

### Fixed

- **Subject pool disappearing after state refactor** — `ui-board.js` was accessing `PlannerState.plan` directly. After `_plan` became a private variable this returned `undefined`, causing the semester render loop to produce zero terms and the subject pool to never draw. Fixed by adding a `getPlan()` accessor to `PlannerState` and updating the one reference in `ui-board.js`. ([`d229d6f`](https://github.com/clancycodesbad/LPABplanner/commit/d229d6f1d30bb5eb6c2b91d74cae950076b86fca))

[1.3.1]: https://github.com/clancycodesbad/LPABplanner/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/clancycodesbad/LPABplanner/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/clancycodesbad/LPABplanner/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/clancycodesbad/LPABplanner/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/clancycodesbad/LPABplanner/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/clancycodesbad/LPABplanner/releases/tag/v1.0.0
