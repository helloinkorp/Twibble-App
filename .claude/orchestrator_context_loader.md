# Orchestrator Context Auto-Loader

## Required Files (Load at Session Start)
1. AGENT_GUIDELINES.md - Core orchestrator behavior
2. CLAUDE.md - Project/global rules  
3. Design_system.md - Visual specifications and UI standards
4. prd.md - Requirements specification
5. tasks.txt - Task ledger
6. progress_ledger.md - JSON checkpoint log
7. plan.md - Phase plans & dependencies

## Loading Script
```bash
# Add to session start hook
echo "Loading orchestrator context..."
cat AGENT_GUIDELINES.md
cat CLAUDE.md
cat Design_system.md
cat prd.md
cat tasks.txt
cat progress_ledger.md
cat plan.md
```

## Validation Checklist
- [ ] All 7 core files loaded
- [ ] TraceID generated for session
- [ ] Subagent limits configured (max 5-8)
- [ ] Ledgers synchronized
- [ ] Design_system.md compliance requirements understood