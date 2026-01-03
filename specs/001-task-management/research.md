# Research: Task Management

**Feature**: 001-task-management
**Date**: 2026-01-03
**Phase**: 0 - Research

## Technology Decisions

### CLI Framework: Commander.js

**Decision**: Use Commander.js for CLI argument parsing and command structure.

**Rationale**:
- Most popular Node.js CLI framework with excellent TypeScript support
- Built-in help generation (`--help`) satisfies constitution requirement
- Subcommand pattern matches our `todo add|list|complete|delete` structure
- Zero configuration, minimal learning curve
- Active maintenance and large community

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| yargs | More complex API, heavier weight for simple CLI |
| oclif | Over-engineered for single-command tool, adds framework overhead |
| meow | Less structured, no built-in subcommand support |
| cac | Smaller community, less TypeScript documentation |

### Testing Framework: Vitest

**Decision**: Use Vitest for both unit and integration testing.

**Rationale**:
- Native ESM and TypeScript support without configuration
- Jest-compatible API (familiar syntax)
- Fast execution with watch mode for TDD workflow
- Built-in coverage reporting
- Single dependency for all testing needs

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Jest | Requires additional configuration for ESM/TypeScript |
| Mocha + Chai | Multiple dependencies, more setup overhead |
| Node test runner | Less mature, fewer features for integration testing |

### Storage Format: JSON with Atomic Writes

**Decision**: Store tasks in `.todo` JSON file with atomic write operations.

**Rationale**:
- Human-readable for debugging (constitution: Observability)
- Native JavaScript parsing, no dependencies needed
- Atomic writes prevent corruption on crash
- Portable across platforms

**Implementation Details**:
- Write to `.todo.tmp` first, then rename to `.todo` (atomic on POSIX/Windows)
- Pretty-print JSON with 2-space indentation for readability
- Include schema version field for future migrations

### ID Generation: Auto-incrementing Counter

**Decision**: Use simple auto-incrementing numeric IDs stored with task list.

**Rationale**:
- Simplest approach (constitution: Simplicity & YAGNI)
- IDs are never reused per spec requirements
- Counter stored in JSON alongside tasks (single file)
- Easy to reference in CLI commands (`todo complete 3`)

**Schema**:
```json
{
  "version": 1,
  "nextId": 4,
  "tasks": [...]
}
```

### Output Formatting: Dual Mode (Human + JSON)

**Decision**: Human-readable table by default, structured JSON with `--json` flag.

**Rationale**:
- Constitution requires both formats
- Human format uses simple aligned columns (no external dependencies)
- JSON format enables scripting and piping

**Human Format Example**:
```
ID  Status     Description
1   [x]        Buy groceries
2   [ ]        Call mom
3   [ ]        Finish report
```

**JSON Format Example**:
```json
{
  "tasks": [
    {"id": 1, "description": "Buy groceries", "status": "completed", "created": "2026-01-03T10:00:00Z"}
  ]
}
```

## Best Practices Applied

### Error Handling Strategy

- Custom error classes extending `Error` for type discrimination
- All errors include: code (for exit status), message (for user), context (for debugging)
- Exit codes: 0 = success, 1 = user error (bad input), 2 = system error (file I/O)

### File Locking Approach

- Use `proper-lockfile` package for cross-platform file locking
- Lock acquired before read, released after write
- Timeout after 5 seconds with clear error message
- Graceful fallback: warn if lock can't be acquired but proceed (single-user assumption)

### TypeScript Configuration

- `strict: true` in tsconfig.json
- `noUncheckedIndexedAccess: true` for safer array/object access
- `exactOptionalPropertyTypes: true` for precise optional handling
- ESM module format (`"type": "module"` in package.json)

## Dependencies Summary

| Package | Version | Purpose |
|---------|---------|---------|
| commander | ^12.x | CLI parsing and help generation |
| vitest | ^2.x | Testing framework |
| typescript | ^5.x | Type checking and compilation |
| proper-lockfile | ^4.x | Cross-platform file locking |
| @types/node | ^20.x | Node.js type definitions |

**Total runtime dependencies**: 2 (commander, proper-lockfile)
**Total dev dependencies**: 3 (vitest, typescript, @types/node)

## Open Questions Resolved

All technical decisions made. No outstanding research items.
