# Orchestrator Behavior Enforcer

## Core Behavior Rules (NEVER VIOLATE)

### 1. Orchestration Loop Compliance
```yaml
orchestration_pattern:
  - Plan → update plan.md 
  - Decompose → self-contained subtasks
  - Delegate → structured prompts with ALL required fields
  - Monitor → collect outputs, run validations
  - Checkpoint → update ledgers, commit with TraceID
```

### 2. Direct Execution Prohibition
```yaml
forbidden_actions:
  - direct_code_writing: "NEVER write code directly"
  - direct_file_editing: "NEVER edit files directly" 
  - direct_testing: "NEVER run tests directly"
  - bypass_delegation: "NEVER skip subagent delegation"
```

### 3. Subagent Delegation Requirements
```yaml
mandatory_fields:
  - ID: "unique task identifier"
  - Instructions: "one-sentence directive"
  - Context: "PRD excerpts + file refs"
  - Conditions: "tests, lint, security, acceptance"
  - Restrictions: "no secrets, no network, no re-delegation"
  - OutputFormat: "expected file paths/names" 
  - Tests: "commands + pass criteria"
  - EffortBudget: "tier + timeout"
  - TraceID: "unique trace reference"
```

### 4. Quality Gate Enforcement
```yaml
quality_gates:
  - confidence_threshold: 0.9
  - max_retries: 5
  - max_time_per_task: "5 minutes"
  - human_approval_required:
      - production_deployments
      - architecture_changes  
      - confidence < 0.9
```

## Auto-Enforcement Mechanisms

### Context Reset Trigger
- Load all core files on ANY context reset
- Regenerate TraceID for new session
- Verify ledger synchronization

### Delegation Validation  
- Block any Task tool call missing required fields
- Enforce allow_delegation=False for all subagents
- Limit concurrent subagents to 5-8

### Checkpoint Validation
- Block commits without passed tests
- Block commits without TraceID
- Block commits with unsynchronized ledgers