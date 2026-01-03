# Data Model: Task Management

**Feature**: 001-task-management
**Date**: 2026-01-03
**Phase**: 1 - Design

## Entities

### Task

Represents a single todo item.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique auto-incrementing identifier (never reused) |
| description | string | Yes | Text describing what needs to be done (non-empty) |
| status | TaskStatus | Yes | Current state: "pending" or "completed" |
| createdAt | string (ISO 8601) | Yes | Timestamp when task was created |

**TypeScript Interface**:
```typescript
interface Task {
  id: number;
  description: string;
  status: TaskStatus;
  createdAt: string; // ISO 8601 format
}

type TaskStatus = "pending" | "completed";
```

**Validation Rules**:
- `id`: Must be positive integer, assigned by system
- `description`: Non-empty string, whitespace-only rejected
- `status`: Must be exactly "pending" or "completed"
- `createdAt`: Valid ISO 8601 timestamp

### TaskStore

Root storage structure containing all tasks and metadata.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | number | Yes | Schema version for future migrations |
| nextId | number | Yes | Counter for next task ID assignment |
| tasks | Task[] | Yes | Array of all tasks |

**TypeScript Interface**:
```typescript
interface TaskStore {
  version: number;
  nextId: number;
  tasks: Task[];
}
```

**Validation Rules**:
- `version`: Must be 1 (current schema version)
- `nextId`: Must be positive integer > max existing task ID
- `tasks`: Array (may be empty)

## State Transitions

### Task Status

```
┌─────────┐                    ┌───────────┐
│ pending │ ──── complete ───► │ completed │
└─────────┘                    └───────────┘
     ▲                              │
     │                              │
     └────── (no reverse) ──────────┘
```

**Transition Rules**:
- New tasks always start as "pending"
- "pending" → "completed" via `complete` command
- "completed" → "pending" not supported (no uncomplete)
- Both states can be deleted

## Storage Schema

### File Location
- Path: `.todo` in current working directory
- Created automatically on first task add

### JSON Schema (v1)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["version", "nextId", "tasks"],
  "properties": {
    "version": {
      "type": "integer",
      "const": 1
    },
    "nextId": {
      "type": "integer",
      "minimum": 1
    },
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "description", "status", "createdAt"],
        "properties": {
          "id": {
            "type": "integer",
            "minimum": 1
          },
          "description": {
            "type": "string",
            "minLength": 1
          },
          "status": {
            "type": "string",
            "enum": ["pending", "completed"]
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      }
    }
  }
}
```

### Example File Contents

```json
{
  "version": 1,
  "nextId": 4,
  "tasks": [
    {
      "id": 1,
      "description": "Buy groceries",
      "status": "completed",
      "createdAt": "2026-01-03T10:00:00.000Z"
    },
    {
      "id": 2,
      "description": "Call mom",
      "status": "pending",
      "createdAt": "2026-01-03T10:05:00.000Z"
    },
    {
      "id": 3,
      "description": "Finish report",
      "status": "pending",
      "createdAt": "2026-01-03T10:10:00.000Z"
    }
  ]
}
```

## Operations

### Add Task
- Input: description (string)
- Output: created Task
- Side effects: Increment nextId, append to tasks array, write file

### List Tasks
- Input: none
- Output: Task[] (all tasks)
- Side effects: none (read-only)

### Complete Task
- Input: id (number)
- Output: updated Task
- Side effects: Update task status, write file
- Errors: TaskNotFoundError if ID doesn't exist

### Delete Task
- Input: id (number)
- Output: deleted Task
- Side effects: Remove from tasks array, write file
- Errors: TaskNotFoundError if ID doesn't exist

## Error Types

| Error | Code | When |
|-------|------|------|
| TaskNotFoundError | 1 | Task ID doesn't exist |
| EmptyDescriptionError | 1 | Description is empty/whitespace |
| StorageCorruptedError | 2 | JSON parse fails or schema invalid |
| StorageAccessError | 2 | File read/write permission denied |
