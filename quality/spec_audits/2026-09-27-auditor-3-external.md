# Spec Audit — Auditor 3 (model identity unconfirmed)

> External audit run by the operator via Perplexity, using its "GPT 6 Sol Thinking" model selector, response pasted back verbatim.
> Date run: 2026-09-27 · Project: LPABplanner
>
> **Provenance note:** the response text itself states it is a Perplexity-branded review, not a GPT-5.1 response. When the operator asked why, Perplexity's own assistant confirmed it had conflated its platform branding with the selected model, and that it cannot independently verify which underlying model produced the output from inside that chat. This slot is recorded as a genuinely independent third review with **unconfirmed model identity** — not represented as GPT-5.1, since the requested-vs-delivered mismatch affects how much independence this slot adds to the council.

## Reviewer's response

**Finding: Current-term-only exam warnings**
Verdict: CONFIRMED
Citations: REQ-005, REQ-006, REQ-020, C-011, C-013, C-025, C-026, C-063
Reasoning: Exam-clash comparison only runs when `semesterId === currentTerm`; lecture clashes are not so scoped. Conflicts with the unqualified multi-year clash-detection promise. Notes a plausible countervailing reason: `subject.exam` may represent only the currently published timetable, so reusing it for future semesters risks false positives against non-representative dates.
Severity: HIGH.
Agreement: Partially agree — the scope gap is real, but unconditional all-future-term matching overlooks the risk of comparing current/historical dates as if they were future ones. Whether the fix is conditional warning, distinguishing tentative dates, or retaining current-term-only scope is a maintainer decision.

**Finding: Display bypasses exam parser**
Verdict: CONFIRMED
Citations: REQ-007, REQ-008, REQ-020, C-020, C-025, C-062, C-063, C-064
Reasoning: `getExamText` tests truthiness only; `parseExamDate`/`examTimesClash` separately reject malformed strings. A truthy malformed value can display while failing to participate in clash comparison.
Severity: HIGH.
Agreement: Agree with REQ-007(d), REQ-020(d), and the quality scenario.

**Finding: Group/type consistency is unenforced**
Verdict: CONFIRMED
Citations: REQ-010, REQ-011, REQ-012, C-015, C-016, C-017, C-034–046, C-065–071, C-072–080
Reasoning: No equality check exists between `group` and `type`; confirms the lack of enforcement and the conditional mismatch path, not that the current dataset contains a mismatch (no roster was supplied to verify independently).
Severity: MEDIUM.
Agreement: Agree this is architectural guidance at Tier 5. Disagree with treating asserted dataset consistency as independently verified from the supplied excerpts alone.

**Finding: Both drag paths can lose a subject**
Verdict: CONFIRMED
Citations: REQ-001, REQ-002, REQ-003, REQ-013, C-004, C-005, C-038, C-040, C-070, C-072, C-075
Reasoning: Both DnD paths remove the source placement before attempting the target add, with no rollback; a full target semester triggers loss.
Severity: HIGH.
Agreement: Agree; any remedy must cover both independent implementations.

**Finding: Export order is nonchronological**
Verdict: CONFIRMED
Citations: REQ-021, C-052, C-059, C-069, C-081
Reasoning: Lexical sort on season+year keys does not match chronological order. The supplied contracts establish the export-vs-abstract-chronology disagreement but do not fully specify the board's actual render order, so a claim that it differs from the true on-screen order is plausible but not proven by the excerpts alone.
Severity: LOW.
Agreement: Partially agree — the alphabetical-vs-chronological observation is correct, but rated LOW rather than MEDIUM absent evidence of downstream harm or a proven board-render-order mismatch. Severity disagreement only, not a provenance change.

**Finding: NEW — prerequisite placement can be later**
Verdict: QUESTION
Citations: REQ-004, C-007, C-008, C-009, C-010, C-059
Reasoning: The core-order check only checks presence anywhere in the plan, not semester ordering — a later core subject could be placed before an earlier one is scheduled without triggering a warning. REQ-004 promises a warning when an earlier core is "missing," which this technically is not. Plausible unmet user expectation, not a confirmed breach of the stated requirement as written.

**Finding: NEW — invalid semester identifiers are accepted in principle**
Verdict: QUESTION
Citations: REQ-001, REQ-002, C-001–006, C-035, C-038, C-039, C-069
Reasoning: The validator classifies any non-"winter"-containing ID as summer; a malformed ID could in principle pass other checks. The supplied contracts don't establish whether arbitrary IDs are reachable through the UI. Potential for an orphaned placement is real enough to inspect but not established as an end-user defect from the excerpts alone.

## Summary

Seven findings: five CONFIRMED, two QUESTION. Most consequential: the two drag paths' failed-move data loss, the current-term exam-clash blind spot (with an important future-data caveat), and malformed exam dates displayed despite parser rejection. Materially disagree with a MEDIUM framing of export sorting — supported severity is LOW absent board-render-order evidence. No group/type roster, complete board-rendering order, or raw source bytes were supplied, so none was invented.
