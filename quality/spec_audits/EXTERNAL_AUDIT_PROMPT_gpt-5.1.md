# External Spec Audit Prompt — for GPT-5.1

## How to use this file

Copy the entire contents of this file (everything below this "How to use" section) and paste it as a single message into GPT-5.1. It is fully self-contained — it includes the audit instructions, the guardrails, the scrutiny areas, and the complete contents of the project's `REQUIREMENTS.md`, `CONTRACTS.md`, and `QUALITY.md`. You do not need to attach or paste anything else.

When GPT-5.1 responds, save its full response as a new file at:

```
quality/spec_audits/2026-09-26-auditor-3-gpt5.1.md
```

Format the saved file as:

```markdown
# Spec Audit — Auditor 3 (GPT-5.1)

> External audit run by the operator, response pasted verbatim below.
> Date run: <the date you ran this>

## Reviewer's response

<paste GPT-5.1's full response here, unedited>
```

Once you have this file (and the matching Gemini Pro one), tell your AI assistant: **"I've saved the Gemini and GPT-5.1 audit results — please re-run the Phase 4 triage and reconciliation now that the full Council of Three is available."** It will read both files, merge them with the existing in-house auditor-1 findings (`quality/spec_audits/2026-09-26-auditor-1.md`), and produce a proper 3-of-3 triage.

---

## AUDIT PROMPT STARTS HERE — PASTE EVERYTHING BELOW THIS LINE

You are acting as an independent, skeptical code auditor reviewing a small client-side web application against its derived requirements, behavioral contracts, and quality constitution (all three are pasted in full below). Perform a full, independent audit — do not assume the requirements are correct or that the code satisfies them; verify everything against the actual described code, structure, and logic.

### Guardrails

- Cite the specific requirement ID (REQ-NNN) or contract ID (C-NNN) for every finding.
- Do not assume correctness because a pattern is common in other codebases — this is a small, hand-written, single-maintainer hobby project ("unashamedly vibe coded" per its own README), not a widely-vetted library.
- For any claim involving a whitelist, enumeration, or "handles all cases" assertion (e.g., whether a field pairing is always consistent, whether a registry's keys always match an expected pattern, whether a dispatch table covers every case), perform your own explicit two-list comparison using ONLY the code excerpts given below — do not simply trust a completeness claim made in the REQUIREMENTS.md or CONTRACTS.md prose itself, since that prose was written by a prior AI pass and could itself contain an error.
- If you are not confident something is a genuine defect, label it a QUESTION rather than a BUG.
- Where you disagree with a requirement's stated tier, severity, or verdict, say so explicitly and explain why.

### Mandatory scrutiny areas

1. Does the exam-clash detection's restriction to the "current term" (see REQ-006, C-013) match the intent implied by the project's own README description of clash detection (quoted in QUALITY.md — no term-scoping caveat is mentioned there)? Is there any plausible legitimate design reason for this restriction that the requirements document may have missed?
2. Does the exam-date display function ever validate the string it shows against the strict parser described in REQ-007/C-020? (See REQ-020/C-064's claim that it does not.) Do you find this claim credible based on the contracts given, or does it seem like an artifact of incomplete analysis?
3. Does anything enforce the `group`/`type` field-pairing consistency described in REQ-012? Based on C-001 through C-084 as given, is there a code path that could observe or rely on a mismatch that the requirements document didn't consider?
4. Do both drag-and-drop implementations (native mouse per C-070, touch per C-075) share the same "remove before validate" risk? Is there any detail in the given contracts suggesting one implementation actually handles this more safely than the other?
5. Does the markdown export's sort order (C-081) actually disagree with the board's own semester rendering order? Is the severity assessment in REQUIREMENTS.md/QUALITY.md (treated as a "cosmetic"/MEDIUM issue) appropriate, or would you argue for a different severity?

### Minority finding rule

If you find something you believe is a defect that the requirements/contracts document doesn't already discuss, flag it clearly as a **NEW FINDING** with your reasoning. New findings you surface are valuable even if a later reconciliation step determines they don't hold up — do not self-censor a finding just because you're not 100% sure.

### What NOT to do

- Do not assume any Tier 1/2 formal specification exists — this project has none (see REQUIREMENTS.md's tier distribution note at the bottom). Every requirement is either Tier 3 (code-is-the-spec), Tier 4 (the project's own README, treated as informal documentation), or Tier 5 (inferred from code behavior with no documentation backing at all). Do not fabricate or assume an external standard applies.
- Do not suggest style/formatting changes — only flag things that are behaviorally incorrect, inconsistent, or would produce a different outcome than the stated requirement.
- Do not require "executed test evidence" before confirming a finding — a clear code-path trace through the contracts/requirements given below (e.g., "function A does X per C-NNN, but REQ-NNN requires Y") is sufficient evidence to confirm a finding. You are working from the contracts/requirements documents (not the raw source file bytes), so ground every claim in the specific C-NNN/REQ-NNN citations given.

### Expected output format

For each of the 5 mandatory scrutiny areas, and for any additional findings, provide:

```
## Finding: <short title>
**Verdict:** CONFIRMED / NOT CONFIRMED / QUESTION
**Citations:** <REQ-NNN and/or C-NNN references>
**Reasoning:** <your analysis>
**Severity (if CONFIRMED):** HIGH / MEDIUM / LOW, with justification
**Agreement with existing analysis:** state whether you agree, disagree, or partially agree with how REQUIREMENTS.md/QUALITY.md already characterizes this issue (if it does), and why
```

Conclude with a short summary section: total findings, how many are CONFIRMED vs QUESTION, and any finding where you materially disagree with the existing severity/tier assessment already documented below.

---

## PROJECT CONTEXT

LPABplanner is a client-only static web app (plain HTML/CSS/ES6 modules, no backend, no build step) that helps students of the NSW Legal Profession Admission Board's Diploma in Law plan their subject enrollment across semesters, track graduation progress, and detect lecture/exam timetable clashes. Full requirements, contracts, and quality constitution follow.

---

## REQUIREMENTS.md (full contents)

# Requirements

> Generated by [Quality Playbook](https://github.com/andrewstellman/quality-playbook) v1.5.6 — Andrew Stellman
> Date: 2026-09-26 · Project: LPABplanner

## Overview

LPABplanner is a free, community-built, single-page web tool that helps students enrolled in the NSW Legal Profession Admission Board's (LPAB) Diploma in Law map out which of the Diploma's 20 required subjects they will take in which semester, track their progress toward the 17-compulsory-plus-3-elective graduation requirement, and avoid enrolling in two subjects that share a lecture night or an exam time slot. It runs entirely in the browser with no server and no account system — a student's plan lives only in that browser's `localStorage`.

The actors are: **the student** (the only end user — drags subjects between a "pool" of available subjects and semester cards, marks subjects complete, exports their plan, and occasionally resets it), and **the volunteer maintainer** (updates `subjects.js`/`archive.js` twice a year when LPAB releases a new timetable, per the README's documented procedure — this person may not be a programmer, and the update procedure is designed to be followed by copy-pasting values from a published PDF). The Diploma in Law is a real, long-running distance-education pathway to legal practice in NSW administered by the University of Sydney's Law Extension Committee on behalf of LPAB; students using this tool are making genuine multi-year enrollment decisions, and a clash the tool fails to catch is a real scheduling conflict the student discovers too late to fix.

The highest-risk areas, grounded in exploration, are: (1) the two independently-implemented drag-and-drop code paths (mouse vs. touch) that can silently lose a subject from the plan on a failed move; (2) the exam-clash detector's scope gap, which only checks the single "current" term even though the tool's core purpose is multi-year forward planning; and (3) the hand-maintained, twice-yearly data files (`subjects.js`, `archive.js`, `data/stats/*.js`) that a non-programmer volunteer edits directly, with several code paths (date parsing, stats registry) that have no defensive validation against plausible transcription mistakes.

## Use Cases

- **UC-01** — New student sets up their plan via the suggested pathway.
- **UC-02** — Student rebalances their plan by dragging a subject to a different semester.
- **UC-03** — Student tracks graduation progress.
- **UC-04** — Student resolves a lecture-night or exam-time clash.
- **UC-05** — Student checks a subject's exam date before committing.
- **UC-06** — Student exports their plan for use outside the app.
- **UC-07** — Student resets their plan without losing preferences.
- **UC-08** — Maintainer updates the app for a new LPAB semester.

## Requirements by Functional Section

### Semester Validation and Enrollment Rules

**REQ-001** — Term availability enforcement. Tier 3. A subject must not be addable to a semester whose season doesn't appear in the subject's `terms` array. Implementation: `engine.js:8-13` (`isAvailableInTerm`), `engine.js:15-28` (`validateSemester`). Bypassed for `semesterId === 'completed'`.

**REQ-002** — Semester capacity limit. Tier 3. A semester must reject a new subject once it already holds 4 subjects. Implementation: `engine.js:23-25`. No cap for `completed`.

**REQ-003** — Duplicate-subject prevention. Tier 3. A subject already present anywhere in the plan must not be addable again. Implementation: `planner-state.js:70-73`.

### Core Subject Sequencing

**REQ-004** — Core-order advisory warning. Tier 3. Placing a core subject while an earlier-sequence core subject is missing produces a non-blocking warning, never an error. Implementation: `engine.js:44-62` (`checkCoreOrder`), invoked from both `planner-state.js:86-89` and `ui-board.js:50-58`.

### Clash Detection

**REQ-005** — Lecture-night clash detection (all semesters). Tier 3. Two subjects sharing a `lecture` value in the same semester are both flagged, unconditional on which semester. Implementation: `engine.js:64-79`.

**REQ-006** — Exam-time clash detection (current term only) — flagged completeness gap. Tier 3. Two subjects with identical exam date-times in the same semester are flagged — **but only when the semester equals `currentTerm`** (`engine.js:81`). Condition (d): two subjects with identical exam times placed in a semester that is NOT `currentTerm` receive NO exam-clash warning at all, even though the same pair would be flagged in the current term. This is documented as the actual (gap) behavior.

**REQ-007** — Exam date parsing strictness. Tier 4/3. `parseExamDate` must accept exactly `'D Mon YYYY, H.MM am/pm'` (case-insensitive am/pm) and return `null` with a console warning for anything else. Condition (d): the display layer (`getExamText`, REQ-020) never calls this parser and will show a malformed string verbatim as if valid.

**REQ-008** — Exam-time equality is exact. Tier 3. `examTimesClash` returns true only on exact minute-level match; near-misses are never flagged.

**REQ-009** — Null-safe clash inputs. Tier 3. A subject with `exam: null` must never be reported as clashing with anything, and must never throw.

### Progress Tracking and Graduation Status

**REQ-010** — Compulsory/elective progress counts. Tier 3. Counts subjects whose `type` (case-insensitive) is compulsory/elective, across every semester including `completed`. Implementation: `engine.js:94-108`.

**REQ-011** — Graduation-ready determination. Tier 3. `readyToGraduate` is true iff exactly 17 compulsory-type subjects AND at least 3 elective-type subjects are present. Thresholds (17/3) are hardcoded literals, independent of `subjects.js`'s actual contents.

**REQ-012** — `group`/`type` field consistency (architectural guidance). Tier 5. Every subject's `group` field (used by UI display/styling) and `type` field (used exclusively by `engine.js`'s graduation math) must always agree on compulsory/elective classification. No code enforces this; it is currently true only because the dataset happens to be entered consistently.

### Persistence and State Management

**REQ-013** — Autosave on every mutation. Tier 4/3. Every successful plan mutation persists to `localStorage` before returning. Implementation: `planner-state.js`, `savePlan(_plan)` calls in `addSubject`/`removeSubject`/`markCompleted`/`resetPlanOnly`.

**REQ-014** — Storage failure resilience. Tier 3. Every `localStorage` read/write is wrapped so a thrown exception degrades to a safe default rather than crashing the app. Implementation: `storage.js`, every exported function has try/catch.

**REQ-015** — Two-step destructive reset confirmation. Tier 4/3. Neither reset action executes until the user selects a type AND explicitly confirms on a second screen; backdrop/Cancel abort with zero state change. Implementation: `ui-toolbar.js:54-141`.

### Onboarding

**REQ-016** — First-run wizard gating. Tier 3. The wizard shows exactly once, gated by a flag, and skips gracefully if its DOM container is missing.

**REQ-017** — Onboarding placement failures must surface (currently unmet). Tier 5. When onboarding automatically places subjects (suggested-pathway apply, completed-subject batch add), any placement failure must be surfaced to the student, consistent with the manual drag-and-drop error-surfacing pattern. **Currently unmet:** `applyPathway` (`ui-onboarding.js:157-165`) and the Path B confirm handler (`ui-onboarding.js:220-226`) both discard `addSubject`'s return value in a loop.

### Subject Pool Display

**REQ-018** — Pool excludes placed and hidden subjects. Tier 3. The pool sidebar excludes any subject already in the plan, and separately moves hidden subjects into a collapsible section.

### Exam Date Display

**REQ-019** — Exam-clash warning display. Tier 3. A subject slot renders every warning returned for it, styled distinctly from non-clashing slots.

**REQ-020** — Exam text fallback chain. Tier 3. For a non-current, non-completed semester: prefer the subject's own future-term exam date; else search historical archive newest-first; else show "TBA". Condition (d): a malformed-but-non-null exam string is shown verbatim as if valid — see REQ-007(d).

### Export

**REQ-021** — Markdown export completeness and ordering. Tier 4/3. Every non-empty semester appears in the export; each subject line includes id/name/lecture/exam. Condition (c): semesters are sorted **alphabetically** (`Object.keys(plan)...sort()`, `ui-toolbar.js:26`), not chronologically — e.g. `'summer2030'` sorts before `'winter2029'` alphabetically despite `winter2029` occurring first in real time.

---

## CONTRACTS.md (full contents)

# Behavioral Contracts

Every behavioral contract observed in the source (Phase A discovery — exhaustive listing).

## engine.js
- C-001: `isAvailableInTerm(subject, termId)` returns `true` unconditionally when `termId === 'completed'`.
- C-002: `isAvailableInTerm` derives `'winter'`/`'summer'` from whether `termId` (lowercased) contains `'winter'`; anything not containing `'winter'` is treated as `'summer'`.
- C-003: `isAvailableInTerm` returns whether `subject.terms` (case-insensitively) includes the derived term string.
- C-004: `validateSemester` pushes an error if the subject isn't available in the target term.
- C-005: `validateSemester` pushes an error if the target semester already has 4 or more subjects.
- C-006: `validateSemester` returns an empty array when both checks pass.
- C-007: `checkCoreOrder` returns `null` immediately if the subject is not in `CORE_ORDER` or is first in sequence.
- C-008: `checkCoreOrder` computes "missing prior" core subjects by checking whether every earlier `CORE_ORDER` ID appears anywhere in the flattened plan (any semester, including `completed`).
- C-009: `checkCoreOrder` returns `null` if no prior core subjects are missing.
- C-010: `checkCoreOrder` returns a warning string naming all missing prerequisite subjects by name when any are missing.
- C-011: `getClashingSubjects` compares every unordered pair of subjects in a semester list.
- C-012: A lecture clash is recorded (both ways) when two subjects share the exact same `lecture` string.
- C-013: An exam clash is recorded (both ways) via `examTimesClash` **only when** `semesterId === currentTerm`.
- C-014: `getClashingSubjects` deduplicates identical warning strings per subject.
- C-015: `calculateProgress` flattens all semester arrays (including `completed`) into one list.
- C-016: `calculateProgress` counts subjects whose `type.toLowerCase() === 'compulsory'` and `'elective'` separately.
- C-017: `calculateProgress` returns `readyToGraduate: true` iff `compulsoryCount === 17 && electiveCount >= 3`.
- C-018: `calculateProgress` required counts are hardcoded to 17 (compulsory) and 3 (electives), independent of the actual `subjects.js` contents.

## js/utils/datetime.js
- C-019: `parseExamDate(null|undefined)` returns `null` with no warning (documented safe no-op).
- C-020: `parseExamDate` requires exactly `D Mon YYYY, H.MM am/pm`; anything else logs a warning and returns `null`.
- C-021: `parseExamDate` returns `null` and logs a warning if the month abbreviation isn't recognized.
- C-022: `parseExamDate` converts 12-hour to 24-hour correctly (pm+≠12 adds 12; am+12 sets 0).
- C-023: `formatExamDate` returns `null` for non-Date or invalid-Date input.
- C-024: `formatExamDate` converts 24-hour back to 12-hour display correctly.
- C-025: `examTimesClash(examA, examB)` returns `false` if either input fails to parse.
- C-026: `examTimesClash` returns `true` iff both parsed times are exactly equal (`getTime()` equality).
- C-027: `sortByExamDate` does not mutate its input array.
- C-028: `sortByExamDate` places subjects with unparseable/absent exam dates at the end.

## js/state/storage.js
- C-029: Every exported function wraps `localStorage` access in try/catch and never throws.
- C-030: `loadPlan()` returns `{ completed: [] }` on absence/parse-failure/throw.
- C-031: `loadHiddenSubjects()` returns `[]` on any failure or absence.
- C-032: `clearPlanOnly()` removes only the plan key.
- C-033: `clearAll()` removes all three keys (plan, hidden, onboarding).

## js/state/planner-state.js
- C-034: Module-level `_plan`/`_hidden` are initialized once at import time.
- C-035: `getSemester(id)` auto-creates (but does not immediately persist) an empty array at `_plan[id]` if absent.
- C-036: `getClashes(semesterId)` returns `{}` if the semester doesn't exist in `_plan`, without mutating `_plan`.
- C-037: `getClashes` defaults `currentTerm` to `'winter2026'` if the imported `currentTerm` is nullish.
- C-038: `addSubject` rejects if the subject is already anywhere in the plan.
- C-039: `addSubject` skips `Engine.validateSemester` entirely when `semesterId === 'completed'`.
- C-040: `addSubject` calls `savePlan` immediately after a successful push, before checking for a core-order warning.
- C-041: `addSubject` returns `{success:true, warnings:[...]}` when a core-order warning applies, else `{success:true}` alone.
- C-042: `removeSubject` is a silent no-op if the semester doesn't exist.
- C-043: `markCompleted` is a silent no-op if the semester doesn't exist or the subject isn't found.
- C-044: `markCompleted` splices the subject out of its source and pushes it onto `completed`.
- C-045: `resetPlanOnly` resets `_plan` to `{completed: []}`; hidden-subjects storage is untouched.
- C-046: `restoreSubject` removes the given ID from `_hidden` and persists.

## js/services/stats-service.js
- C-047: `effectiveFail(stats)` returns `stats.fail` unchanged if `dns` is absent/zero.
- C-048: `effectiveFail` computes `((failCount + dns) / (sat + dns)) * 100` rounded to 2dp when `dns > 0`.
- C-049: `effectiveFail` falls back to `stats.fail` if `sat + dns === 0` even when `dns > 0`.
- C-050: `normalisedBands` maps v1's `merit` field to the returned `credit` field; v1 has no `hd`.
- C-051: `normalisedBands` for v2 passes `credit`/`hd` through as-is.
- C-052: `sortedTerms()` sorts ascending by 4-digit year, then places `summer`-prefixed before `winter`-prefixed within the same year.
- C-053 through C-057: term-history/latest-stats/high-fail-subjects/difficulty-band/available-terms lookup helpers, all pure functions over the sorted term list.

## js/data/suggested-pathway.js
- C-058: `SUGGESTED_PATHWAY` is a fixed 8-entry array; entries 6-8 declare `electiveSlots: 1`.
- C-059: `generateTermSequence(currentTerm)` alternates Winter/Summer, incrementing the year only on a Summer→Winter transition.
- C-060: `generateTermSequence` extracts the starting year via 4-digit regex, defaulting to the current calendar year if no match.

## js/ui/ui-board.js
- C-061: `getExamText` returns `''` for `semesterId === 'completed'`.
- C-062: `getExamText` shows the live `subject.exam` (or "TBA") when `semesterId === currentTerm`.
- C-063: `getExamText` for non-current terms prefers the subject's own future exam field, else searches historical archive newest-first.
- C-064: `getExamText` never calls `parseExamDate` — treats `subject.exam` truthiness alone as "has an exam string."
- C-065 through C-068: `handleAddSubject` clears feedback state, shows non-blocking core-order warning before the add attempt, shows an error banner on failure, and additionally fires a toast on touch-primary devices.
- C-069: `renderPlannerBoard` computes how many extra semesters to render from remaining unassigned subjects, from a fixed 30-term list.
- C-070: `handleDrop` removes the subject from its source (if source differs from target and isn't 'pool') BEFORE calling `handleAddSubject` on the target — no rollback if the add fails.
- C-071: `window.removeSubject`/`window.markCompleted` are global functions invoked from inline `onclick=` attributes.

## js/ui/ui-touch-dnd.js
- C-072: Touch DnD handlers ignore all events where `e.pointerType === 'mouse'`.
- C-073: `getDropTarget` temporarily hides the ghost element so `elementFromPoint` doesn't detect the ghost itself.
- C-074: `semesterIdFromContainer` returns `'completed'` for the completed-slots container, or derives a term ID from the enclosing `.semester-card`'s `<h2>` text via a single (non-global) `.replace(' ', '')` + `.toLowerCase()`.
- C-075: `onPointerUp` mirrors `handleDrop`'s remove-then-add sequence with no rollback (same defect surface as C-070).
- C-076: `initTouchDnD` re-attaches handlers idempotently (remove-then-add listener pattern), safe to call after every render.

## js/ui/ui-onboarding.js
- C-077: `showOnboardingIfNeeded` calls `onComplete()` immediately if the `#onboarding-overlay` element is missing.
- C-078: `applyPathway` and the Path B confirm handler call `PlannerState.addSubject` in a loop without checking/reporting the returned result.
- C-079: `finishWizard` always calls `markOnboardingDone()` regardless of path or outcome.
- C-080: Path C computes the hidden-subjects list as "every subject ID not checked," defaulting all checkboxes to checked.

## js/ui/ui-toolbar.js
- C-081: `handleExport` includes a `## Completed` section first, then all other semester keys **sorted alphabetically** (not chronologically) — e.g. `'summer2030'` sorts before `'winter2029'` despite 2029 preceding 2030 chronologically.
- C-082: `handleReset`'s modal requires two explicit clicks before any destructive action; backdrop/Cancel abort with no changes.
- C-083: The "full reset" path calls `clearAll()` then reloads the page after a 1-second delay.
- C-084: `showToast` removes any existing toast before creating a new one, self-removes after 3000ms.

---

## QUALITY.md (full contents)

# Quality Constitution

## 1. Purpose

For LPABplanner, "fitness for use" means: a student can build a multi-year enrollment plan, trust that everything they placed is still there when they come back to it, and trust that the tool will actually warn them about a real scheduling conflict — not just the conflicts that happen to fall in whichever semester the tool currently treats as "current."

## 2. Coverage Targets (summary)

`engine.js` (validation/clash/progress): 100% branch coverage of pure logic — this is the entire safety net of the app. `js/utils/datetime.js`: 100% of documented format + malformed-input cases — single point of failure for hand-maintained data updates. `js/services/stats-service.js`: core derivation functions fully covered. `js/state/planner-state.js`/`storage.js`: every persistence path (success + storage-throws) covered — silent data loss is the worst possible failure for a planning tool. UI modules: requirement/contract documentation + manual/integration verification only (DOM-dependent, zero-build-step constraint).

## 3. Coverage Theater Prevention (examples avoided)

Asserting `calculateProgress({})` "doesn't throw" without checking actual counts; asserting `parseExamDate(...) instanceof Date` without checking actual values; mocking `localStorage` to always succeed and never testing the throw-path; asserting `getClashingSubjects` "returns an object" without checking which subject IDs/warnings are present.

## 4. Fitness-to-Purpose Scenarios (summary)

**Scenario 1** — A student drags a subject from a full semester to another full semester and loses it entirely (remove-before-validate in both DnD paths, C-070/C-075).
**Scenario 2** — A student plans two clashing exams into next year and gets no warning (REQ-006/C-013's current-term-only scoping).
**Scenario 3** — A mistyped exam date in a data update looks like a real date and evades clash detection simultaneously (REQ-007(d)/REQ-020(d), C-064).
**Scenario 4** — A single bad key in the hand-maintained stats registry crashes the entire pool and board render (`sortedTerms()`'s unguarded `.match(/\d{4}/)[0]`).

## 5. AI Session Quality Discipline (summary)

Never touch the stale `html file version/LPABPlannerApp.html` snapshot. Never add logic to the `planner.js` re-export shim. Any change to the exam-date string format must be paired with a `datetime.js` parser update. Any fix to the drag-and-drop remove-then-add pattern must be applied to BOTH `ui-board.js` and `ui-touch-dnd.js` — they are parallel, independently-maintained implementations of the same operation.

## 6. The Human Gate (summary)

Whether the exam-clash current-term-only scoping is intentional or an oversight requires a maintainer/domain-owner decision. Whether the markdown export's alphabetical ordering is worth fixing is a human judgment call. Any fix touching the twice-yearly maintenance procedure must be validated by a human against the next real LPAB timetable PDF.

---

## END OF INLINED CONTEXT — perform your audit now per the instructions above.
