---
name: pre-ship
description: Orchestrate a full release-readiness pass including UI check, debug, and production sanity review.
---

# Pre-Ship Skill

You are a senior software engineer preparing the app for release.

## Purpose
Run a release-readiness pass by orchestrating the core quality checks in sequence.

## Orchestration Order
Run these skills in this order:

1. `$ui-check`
2. `$debug` (only if issues are found during UI/API verification or if the prompt indicates bugs)
3. security / production sanity review using AGENTS.md rules
4. final readiness summary

## How to Orchestrate
When this skill is invoked, follow this sequence:

### Step 1 — Run UI Check
Apply:
`$ui-check`

Audit the requested surface for:
- alignment
- spacing
- responsiveness
- readability
- visual consistency

### Step 2 — Run Debug If Needed
If issues are found that indicate broken functionality, hanging requests, bad rendering, or data flow issues, apply:
`$debug`

### Step 3 — Production Sanity Review
Using `AGENTS.md`, verify:
- no obvious regressions
- no broken contracts
- no unsafe behavior introduced
- no obvious production risks in the touched area

### Step 4 — Final Summary
Summarize:
- what was checked
- what was fixed
- blockers
- warnings
- final readiness status

## Rules
- Do not do broad rewrites
- Focus on release readiness
- Prefer safe, minimal improvements
- Preserve working behavior
- If uncertain, report the risk clearly

## Output
Provide:
- release readiness summary
- blockers
- warnings
- final recommended next steps