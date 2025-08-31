# Checkpoint Validation Protocol

## Pre-Commit Checklist (MANDATORY)
```yaml
checkpoint_requirements:
  - all_tests_passed: true
  - lint_checks_passed: true  
  - security_scans_passed: true
  - ledgers_synchronized:
      - tasks.txt matches progress_ledger.md
      - all pending tasks documented
  - docs_updated:
      - PRD reflects changes
      - changelog updated
  - human_signoff:
      - required_if: confidence < 0.9
      - required_for: [production, architecture_changes]
  - trace_id_included: true
```

## Validation Command
```bash
# Run before EVERY checkpoint
./validate_checkpoint.sh || echo "CHECKPOINT BLOCKED"
```

## Circuit Breaker Rules
- Max 5 retries per task → escalate to human
- Max 5 minutes per task → escalate to human  
- Confidence < 90% → require human signoff