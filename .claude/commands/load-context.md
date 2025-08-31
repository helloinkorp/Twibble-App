# /load-context - Load Orchestrator Context

Auto-loads all essential orchestrator files after session reset.

## Usage
```
/clear
/load-context
```

## What it does
1. Loads all 7 core orchestrator files
2. Sets up proper context for multi-agent delegation
3. Validates design system compliance requirements
4. Synchronizes task ledgers and progress tracking

## Files Loaded
- `orchestrator/AGENT_GUIDELINES.md` - Orchestrator behavior patterns
- `orchestrator/CLAUDE.md` - Project rules and constraints  
- `orchestrator/Design_system.md` - Visual specifications
- `orchestrator/PRD.md` - Product requirements
- `orchestrator/tasks.txt` - Current task ledger
- `orchestrator/progress_ledger.md` - Session checkpoints
- `orchestrator/plan.md` - Implementation phases

## Auto-Execution
```bash
# Read all essential orchestrator context files
echo "🤖 Loading Twibble orchestrator context..."

# Core orchestration behavior
cat orchestrator/AGENT_GUIDELINES.md

# Project rules and constraints
cat orchestrator/CLAUDE.md

# Visual design specifications
cat orchestrator/Design_system.md

# Product requirements
cat orchestrator/PRD.md

# Current task state
cat orchestrator/tasks.txt

# Progress tracking
cat orchestrator/progress_ledger.md

# Implementation roadmap
cat orchestrator/plan.md

echo "✅ Orchestrator context loaded successfully"
```