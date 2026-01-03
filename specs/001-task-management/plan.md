# Implementation Plan: Task Management

**Branch**: `001-task-management` | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-task-management/spec.md`

## Summary

Implement a CLI-based task management system with core CRUD operations (add, list, complete, delete). Tasks are persisted locally as JSON in the current working directory (`.todo` file). The implementation follows TDD principles with TypeScript strict mode, supporting both human-readable and JSON output formats.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) on Node.js LTS (20.x or 22.x)
**Primary Dependencies**: Commander.js (CLI parsing), Vitest (testing)
**Storage**: JSON file (`.todo` in current working directory)
**Testing**: Vitest for unit tests, integration tests via CLI subprocess execution
**Target Platform**: Cross-platform CLI (Windows, macOS, Linux)
**Project Type**: Single project (CLI tool)
**Performance Goals**: Add/complete/delete < 2s, list 100 tasks < 1s
**Constraints**: Single-user, local-only, no external services
**Scale/Scope**: Personal productivity tool, ~1000 tasks max typical usage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. TDD (NON-NEGOTIABLE) | ✅ PASS | Tests will be written first per red-green-refactor cycle |
| II. CLI-First Interface | ✅ PASS | All operations via CLI commands, --json flag, proper exit codes |
| III. Simplicity & YAGNI | ✅ PASS | Only CRUD operations, JSON file storage, minimal deps |
| IV. Observability | ✅ PASS | --verbose flag planned, actionable error messages required |
| V. Code Quality | ✅ PASS | TypeScript strict, ESLint/Prettier, explicit error handling |

**Gate Status**: PASSED - No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/001-task-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (CLI contract definitions)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
src/
├── commands/           # CLI command implementations
│   ├── add.ts         # todo add <description>
│   ├── list.ts        # todo list [--json]
│   ├── complete.ts    # todo complete <id>
│   ├── delete.ts      # todo delete <id>
│   └── index.ts       # Commander.js program setup
├── lib/               # Core business logic
│   ├── task.ts        # Task entity and operations
│   ├── storage.ts     # JSON file persistence
│   └── errors.ts      # Custom error types
├── models/            # Data structures and types
│   └── types.ts       # Task, TaskList interfaces
└── utils/             # Shared utilities
    └── output.ts      # Human/JSON output formatting

tests/
├── unit/              # Unit tests for lib/
│   ├── task.test.ts
│   └── storage.test.ts
├── integration/       # CLI command tests
│   ├── add.test.ts
│   ├── list.test.ts
│   ├── complete.test.ts
│   └── delete.test.ts
└── fixtures/          # Test data
    └── sample-tasks.json
```

**Structure Decision**: Single project structure selected per constitution. CLI commands in `src/commands/`, business logic in `src/lib/`, types in `src/models/`.

## Complexity Tracking

> No violations detected - table not required.
