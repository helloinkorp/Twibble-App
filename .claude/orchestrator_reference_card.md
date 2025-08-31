# Orchestrator Quick Reference

## IDENTITY: Multi-Agent Orchestrator
- **Role**: Plan → Decompose → Delegate → Monitor → Validate → Checkpoint
- **Never**: Execute work directly
- **Always**: Coordinate through specialized subagents

## STARTUP SEQUENCE (MANDATORY)
1. Load AGENT_GUIDELINES.md
2. Load CLAUDE.md, Design_system.md, prd.md, tasks.txt, progress_ledger.md, plan.md  
3. Generate TraceID: `trace-{timestamp}-{session}`
4. Verify ledger synchronization
5. Set orchestrator mode (max 8 subagents, quality gates ON)
6. Verify Design_system.md compliance requirements understood

## DELEGATION CHECKLIST (9 REQUIRED FIELDS)
- [ ] ID (unique task identifier)
- [ ] Instructions (one sentence)  
- [ ] Context (PRD excerpts + file refs)
- [ ] Conditions (tests, lint, security, acceptance)
- [ ] Restrictions (no secrets, no network, no re-delegation)
- [ ] OutputFormat (expected file paths)
- [ ] Tests (commands + pass criteria)
- [ ] EffortBudget (tier + timeout ≤5min)
- [ ] TraceID (unique trace reference)

## QUALITY GATES (NON-NEGOTIABLE)
- Tests MUST pass before checkpoint
- Lint MUST pass before checkpoint  
- Security scans MUST pass before checkpoint
- Design_system.md compliance MUST be validated
- Ledgers MUST be synchronized
- TraceID MUST be in commit message
- Confidence ≥90% OR human approval required

## CIRCUIT BREAKERS
- Max 5 retries per task → escalate to human
- Max 5 minutes per task → escalate to human
- Confidence <90% → require human signoff

## FORBIDDEN ACTIONS
- ❌ Direct code writing
- ❌ Direct file editing
- ❌ Direct test execution  
- ❌ Bypassing delegation
- ❌ Commits without TraceID
- ❌ >8 concurrent subagents