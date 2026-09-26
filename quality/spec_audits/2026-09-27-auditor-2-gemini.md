# Spec Audit — Auditor 2 (Gemini Pro)

> External audit run by the operator via the prepared prompt file (`EXTERNAL_AUDIT_PROMPT_gemini-pro.md`), response pasted back verbatim.
> Date run: 2026-09-27 · Project: LPABplanner

## Reviewer's response

**Finding: Exam-clash detection "current term" restriction contradicts multi-year planning intent**
Verdict: CONFIRMED
Citations: REQ-006, C-013, QUALITY.md (Scenario 2, Section 1)
Reasoning: C-013 explicitly limits the invocation of `examTimesClash` to only trigger when `semesterId === currentTerm`. The stated purpose of the application is to allow students to "build a multi-year enrollment plan" and "trust that the tool will actually warn them about a real scheduling conflict." A student actively planning semesters two or three years in the future will place subjects with identical exam times and receive zero warnings, completely defeating the core protective value of the clash detector. There is no plausible legitimate design reason to suppress exam clash warnings for future terms when lecture clashes (REQ-005) are checked unconditionally across all semesters.
Severity: HIGH.
Agreement with existing analysis: Agree this is a severe completeness gap; REQ-006 should formally carry HIGH severity given the app's forward-planning purpose.

**Finding: Exam-date display skips parser validation, surfacing malformed data**
Verdict: CONFIRMED
Citations: REQ-007, C-020, REQ-020, C-064, QUALITY.md (Scenario 3)
Reasoning: `getExamText` bypasses `parseExamDate` entirely, relying on raw string truthiness. A typo in `subjects.js` (e.g. wrong date separator) will display a plausible-looking date while `examTimesClash` silently fails to evaluate it.
Severity: HIGH.
Agreement with existing analysis: Strongly agree with QUALITY.md Scenario 3 — structural disconnect between display and validation layers.

**Finding: Unenforced consistency between group and type fields risks silent graduation tracking failures**
Verdict: CONFIRMED
Citations: REQ-010, REQ-011, REQ-012, C-016
Reasoning: No contractual enforcement links `group` (UI) to `type` (graduation math). A misconfigured subject could be displayed as core but counted as elective.
Severity: MEDIUM.
Agreement with existing analysis: Agree it's an architectural vulnerability; recommend elevating to a formal requirement mandating load-time structural validation.

**Finding: Parallel DnD implementations guarantee data loss on failed placement**
Verdict: CONFIRMED
Citations: C-005, C-070, C-075, QUALITY.md (Scenario 1)
Reasoning: Both mouse and touch paths remove the subject from source before validating the target add, with no rollback on rejection (e.g. 4-subject cap).
Severity: HIGH.
Agreement with existing analysis: Completely agree with QUALITY.md Scenario 1.

**Finding: Alphabetical Markdown export scrambles multi-year chronological plans**
Verdict: CONFIRMED
Citations: REQ-021, C-052, C-081
Reasoning: Semester keys (`summer2030`, `winter2029`) sorted alphabetically invert real calendar order.
Severity: HIGH.
Agreement with existing analysis: Strongly disagree with the "cosmetic/MEDIUM" framing — the sole purpose of a chronological export is to show chronological order; scrambling it functionally ruins the deliverable.

**Finding: NEW — Hardcoded 'winter2026' fallback ensures future runtime staleness**
Verdict: CONFIRMED
Citations: C-037
Reasoning: `getClashes` defaults `currentTerm` to `'winter2026'` if nullish — a ticking time bomb in a static client-only app with no backend to correct it.
Severity: MEDIUM.

**Finding: NEW — Brittle string-matching in season derivation**
Verdict: CONFIRMED
Citations: C-002
Reasoning: `isAvailableInTerm` treats any non-"winter"-containing ID as summer, with no validation against malformed IDs.
Severity: LOW.

## Audit Summary

Total Findings: 7 · Confirmed: 7 · Questions: 0

Material Disagreements: Elevated the Markdown export sort to HIGH (from MEDIUM/cosmetic) and formalized the exam-clash current-term limitation as HIGH.
