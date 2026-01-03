<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 0.0.0 → 1.0.0 (MAJOR - initial ratification)

  Modified Principles: N/A (initial creation)

  Added Sections:
  - 5 Core Principles (TDD, CLI-First, Simplicity, Observability, Quality)
  - Development Workflow section
  - Code Standards section
  - Governance section

  Removed Sections: N/A (initial creation)

  Templates Status:
  ✅ .specify/templates/plan-template.md - Constitution Check section compatible
  ✅ .specify/templates/spec-template.md - User scenarios align with TDD principle
  ✅ .specify/templates/tasks-template.md - Test-first workflow compatible

  Deferred Items: None
-->

# Todo Evolution Constitution

## Core Principles

### I. Test-Driven Development (NON-NEGOTIABLE)

All feature development MUST follow the TDD red-green-refactor cycle:

- **Red**: Write failing tests BEFORE any implementation code
- **Green**: Write the minimum code necessary to make tests pass
- **Refactor**: Improve code quality while keeping tests green

**Rules**:
- No production code may be written without a corresponding failing test
- Tests MUST be approved by user before implementation begins
- Test files MUST exist and fail before implementation proceeds
- Integration tests are required for CLI command contracts and inter-module communication

**Rationale**: TDD ensures correctness by design, prevents regression, and produces
self-documenting code through executable specifications.

### II. CLI-First Interface

Every feature MUST be accessible via command-line interface:

- **Input/Output Protocol**: stdin/args for input, stdout for results, stderr for errors
- **Exit Codes**: 0 for success, non-zero for failures (with documented meanings)
- **Output Formats**: Support both human-readable (default) and JSON (`--json` flag)
- **Composability**: Commands MUST be pipeable and scriptable

**Rules**:
- All user-facing functionality MUST have a CLI entry point
- Help text (`--help`) is mandatory for every command
- Commands MUST be idempotent where semantically appropriate

**Rationale**: CLI-first design ensures automation, testing, and integration capabilities
from day one. It also forces clear interface contracts.

### III. Simplicity & YAGNI

Start with the simplest solution that could possibly work:

- **No Premature Abstraction**: Introduce abstractions only when duplication proves harmful
- **No Speculative Features**: Build only what is explicitly required
- **Minimal Dependencies**: Every external dependency MUST be justified
- **Smallest Viable Diff**: Changes MUST be focused and minimal

**Rules**:
- Three instances of duplication before abstracting (Rule of Three)
- Configuration options MUST be justified by concrete use cases
- Reject complexity that serves hypothetical future needs

**Rationale**: Complexity is the primary enemy of maintainability. Simple code is easier
to understand, test, debug, and modify.

### IV. Observability

All operations MUST be traceable and debuggable:

- **Structured Logging**: Use consistent log levels (DEBUG, INFO, WARN, ERROR)
- **Error Messages**: Include context, cause, and suggested remediation
- **Verbose Mode**: Support `--verbose` / `-v` flags for debugging output
- **Dry Run**: Destructive operations SHOULD support `--dry-run` preview

**Rules**:
- Errors MUST include enough context to diagnose without reproducing
- Log messages MUST NOT contain sensitive data (credentials, tokens, PII)
- Performance-critical paths SHOULD be measurable via timing output

**Rationale**: Observable systems reduce debugging time and enable users to understand
behavior without reading source code.

### V. Code Quality Standards

Maintain consistent, professional code quality:

- **Type Safety**: Use TypeScript strict mode; no `any` types without justification
- **Formatting**: Automated formatting (Prettier/ESLint) with zero warnings policy
- **Documentation**: Public APIs require JSDoc; internal code should be self-documenting
- **Error Handling**: All error paths MUST be explicitly handled

**Rules**:
- All code MUST pass linting and type-checking before commit
- Functions longer than 30 lines SHOULD be reviewed for decomposition
- Magic numbers and strings MUST be named constants

**Rationale**: Consistent quality standards reduce cognitive load and enable team scaling.

## Development Workflow

### Branch Strategy

- Feature branches: `feature/description` or `###-feature-name`
- All work starts from and merges back to `main`
- Commits MUST be atomic and self-contained

### Code Review Requirements

- All changes require review before merge
- Reviews MUST verify constitution compliance
- Tests MUST pass in CI before merge is permitted

### Definition of Done

A feature is complete when:
1. All acceptance tests pass
2. Code review approved
3. Documentation updated (if public API changed)
4. No linting or type errors
5. CLI help text is accurate

## Code Standards

### Language & Runtime

- **Primary Language**: TypeScript (strict mode)
- **Runtime**: Node.js LTS
- **Package Manager**: npm or pnpm

### Project Structure

```text
src/
├── commands/     # CLI command implementations
├── lib/          # Core business logic (framework-agnostic)
├── models/       # Data structures and types
└── utils/        # Shared utilities

tests/
├── unit/         # Unit tests for lib/
├── integration/  # CLI command integration tests
└── fixtures/     # Test data and mocks
```

### Testing Standards

- Unit tests for all business logic in `lib/`
- Integration tests for all CLI commands
- Test coverage target: 80% line coverage (not a hard gate)
- Test naming: `describe('functionName', () => { it('should behavior', ...) })`

## Governance

### Amendment Process

1. Propose change via PR with rationale
2. Document impact on existing code
3. Update version per semantic versioning rules
4. Update all dependent templates if principles change

### Versioning Policy

- **MAJOR**: Principle removal, redefinition, or backward-incompatible governance change
- **MINOR**: New principle added or existing guidance materially expanded
- **PATCH**: Clarifications, typo fixes, non-semantic refinements

### Compliance

- All PRs MUST verify constitution compliance before merge
- Architectural Decision Records (ADRs) MUST reference relevant principles
- Violations require explicit justification and documented exception

**Version**: 1.0.0 | **Ratified**: 2026-01-03 | **Last Amended**: 2026-01-03
