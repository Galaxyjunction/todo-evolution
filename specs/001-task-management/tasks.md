# Tasks: Task Management

**Input**: Design documents from `/specs/001-task-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included per constitution (TDD is NON-NEGOTIABLE)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure per plan.md (src/commands/, src/lib/, src/models/, src/utils/, tests/unit/, tests/integration/, tests/fixtures/)
- [x] T002 Initialize Node.js project with package.json (type: module, name: todo-evolution)
- [x] T003 [P] Install runtime dependencies: commander@^12, proper-lockfile@^4
- [x] T004 [P] Install dev dependencies: typescript@^5, vitest@^2, @types/node@^20, eslint, prettier
- [x] T005 [P] Configure TypeScript with tsconfig.json (strict: true, noUncheckedIndexedAccess: true, ESM output)
- [x] T006 [P] Configure ESLint and Prettier for code formatting
- [x] T007 [P] Configure Vitest in vitest.config.ts
- [x] T008 Add npm scripts: build, test, test:watch, lint, typecheck

**Checkpoint**: Project skeleton ready, all tools configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create Task and TaskStore interfaces in src/models/types.ts per data-model.md
- [x] T010 Create custom error classes in src/lib/errors.ts (TaskNotFoundError, EmptyDescriptionError, StorageCorruptedError, StorageAccessError)
- [x] T011 Create output formatting utility in src/utils/output.ts (human-readable and JSON formatters)
- [x] T012 Write unit tests for storage module in tests/unit/storage.test.ts (TDD: write tests first, verify they fail)
- [x] T013 Implement storage module in src/lib/storage.ts (load, save with atomic writes, file locking)
- [x] T014 Create CLI program entry point in src/commands/index.ts with Commander.js (global options: --help, --version, --json, --verbose)
- [x] T015 Create bin entry in package.json pointing to compiled CLI

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Add a New Task (Priority: P1) 🎯 MVP

**Goal**: Allow users to add tasks with descriptions, persisted to .todo file

**Independent Test**: Run `todo add "Buy groceries"` and verify task appears in `todo list` output

### Tests for User Story 1 (TDD - Write First, Verify Fail)

- [x] T016 [P] [US1] Write unit tests for task creation logic in tests/unit/task.test.ts (create task with description, reject empty description)
- [x] T017 [P] [US1] Write integration tests for add command in tests/integration/add.test.ts (successful add, empty description error, JSON output)

### Implementation for User Story 1

- [x] T018 [US1] Implement task creation logic in src/lib/task.ts (createTask function with validation)
- [x] T019 [US1] Implement add command in src/commands/add.ts per cli-contract.md
- [x] T020 [US1] Register add command in src/commands/index.ts
- [x] T021 [US1] Verify all US1 tests pass (run: npm test)

**Checkpoint**: User can add tasks - MVP functional

---

## Phase 4: User Story 2 - List All Tasks (Priority: P1)

**Goal**: Display all tasks with ID, description, and status

**Independent Test**: Add multiple tasks, run `todo list`, verify formatted output shows all tasks

### Tests for User Story 2 (TDD - Write First, Verify Fail)

- [x] T022 [P] [US2] Write integration tests for list command in tests/integration/list.test.ts (list with tasks, empty list message, JSON output, filter flags)

### Implementation for User Story 2

- [x] T023 [US2] Implement list command in src/commands/list.ts per cli-contract.md (human table format, --json, --pending, --completed filters)
- [x] T024 [US2] Register list command in src/commands/index.ts
- [x] T025 [US2] Verify all US2 tests pass

**Checkpoint**: User can add and list tasks - Core workflow functional

---

## Phase 5: User Story 3 - Complete a Task (Priority: P2)

**Goal**: Mark tasks as completed by ID

**Independent Test**: Add task, complete it, verify status changes in list output

### Tests for User Story 3 (TDD - Write First, Verify Fail)

- [x] T026 [P] [US3] Write unit tests for task completion in tests/unit/task.test.ts (complete pending task, idempotent completion, task not found)
- [x] T027 [P] [US3] Write integration tests for complete command in tests/integration/complete.test.ts (complete task, already completed message, not found error, JSON output)

### Implementation for User Story 3

- [x] T028 [US3] Implement task completion logic in src/lib/task.ts (completeTask function)
- [x] T029 [US3] Implement complete command in src/commands/complete.ts per cli-contract.md
- [x] T030 [US3] Register complete command in src/commands/index.ts
- [x] T031 [US3] Verify all US3 tests pass

**Checkpoint**: User can add, list, and complete tasks

---

## Phase 6: User Story 4 - Delete a Task (Priority: P3)

**Goal**: Remove tasks from the list by ID

**Independent Test**: Add task, delete it, verify it no longer appears in list

### Tests for User Story 4 (TDD - Write First, Verify Fail)

- [x] T032 [P] [US4] Write unit tests for task deletion in tests/unit/task.test.ts (delete task, task not found)
- [x] T033 [P] [US4] Write integration tests for delete command in tests/integration/delete.test.ts (delete task, not found error, JSON output)

### Implementation for User Story 4

- [x] T034 [US4] Implement task deletion logic in src/lib/task.ts (deleteTask function)
- [x] T035 [US4] Implement delete command in src/commands/delete.ts per cli-contract.md
- [x] T036 [US4] Register delete command in src/commands/index.ts
- [x] T037 [US4] Verify all US4 tests pass

**Checkpoint**: All CRUD operations complete

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T038 Create sample fixture file in tests/fixtures/sample-tasks.json for test data
- [x] T039 Run full test suite and verify 100% of tests pass
- [x] T040 Run typecheck (npm run typecheck) and fix any errors
- [x] T041 Run linter (npm run lint) and fix any warnings
- [x] T042 Validate quickstart.md examples work end-to-end
- [x] T043 Update package.json version to 1.0.0

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 but US2 depends on US1 (need tasks to list)
  - US3 depends on US1 (need tasks to complete)
  - US4 depends on US1 (need tasks to delete)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Tests require US1 for sample data
- **User Story 3 (P2)**: Can start after Foundational - Tests require US1 for sample data
- **User Story 4 (P3)**: Can start after Foundational - Tests require US1 for sample data

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Unit tests before integration tests
- Core logic before CLI command
- Story complete before moving to next priority

### Parallel Opportunities

- T003, T004, T005, T006, T007 can all run in parallel (different config files)
- T016, T017 can run in parallel (different test files)
- T022 can run while US1 implementation in progress (test file only)
- T026, T027 can run in parallel (different test files)
- T032, T033 can run in parallel (different test files)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch these in parallel (independent config files):
Task T003: "Install runtime dependencies"
Task T004: "Install dev dependencies"
Task T005: "Configure TypeScript"
Task T006: "Configure ESLint/Prettier"
Task T007: "Configure Vitest"
```

## Parallel Example: User Story 1

```bash
# Launch tests in parallel (TDD - write first):
Task T016: "Unit tests for task creation in tests/unit/task.test.ts"
Task T017: "Integration tests for add command in tests/integration/add.test.ts"

# Then implement sequentially:
Task T018: "Task creation logic in src/lib/task.ts"
Task T019: "Add command in src/commands/add.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Add)
4. Complete Phase 4: User Story 2 (List)
5. **STOP and VALIDATE**: Can add and list tasks
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Add) → Test independently → Demo
3. Add User Story 2 (List) → Test independently → Demo (MVP!)
4. Add User Story 3 (Complete) → Test independently → Demo
5. Add User Story 4 (Delete) → Test independently → Demo
6. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD is mandatory**: Write tests first, verify they fail, then implement
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Exit codes: 0 = success, 1 = user error, 2 = system error
