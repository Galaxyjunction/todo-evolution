# CLI Contract: Task Management

**Feature**: 001-task-management
**Date**: 2026-01-03
**Phase**: 1 - Design

## Command Structure

```
todo <command> [options] [arguments]
```

## Global Options

| Option | Short | Description |
|--------|-------|-------------|
| `--help` | `-h` | Display help for command |
| `--version` | `-V` | Display version number |
| `--json` | | Output in JSON format |
| `--verbose` | `-v` | Enable verbose output |

## Commands

### `todo add <description>`

Add a new task to the todo list.

**Arguments**:
| Argument | Required | Description |
|----------|----------|-------------|
| description | Yes | Text description of the task |

**Options**: Global options only

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | Task created successfully |
| 1 | Invalid input (empty description) |
| 2 | Storage error (file access) |

**Output (Human)**:
```
Created task #1: Buy groceries
```

**Output (JSON)**:
```json
{
  "success": true,
  "task": {
    "id": 1,
    "description": "Buy groceries",
    "status": "pending",
    "createdAt": "2026-01-03T10:00:00.000Z"
  }
}
```

**Error Output (Human)**:
```
Error: Task description cannot be empty
```

**Error Output (JSON)**:
```json
{
  "success": false,
  "error": {
    "code": "EMPTY_DESCRIPTION",
    "message": "Task description cannot be empty"
  }
}
```

---

### `todo list`

Display all tasks.

**Arguments**: None

**Options**:
| Option | Description |
|--------|-------------|
| `--all` | Show all tasks (default) |
| `--pending` | Show only pending tasks |
| `--completed` | Show only completed tasks |

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | Success (even if no tasks) |
| 2 | Storage error |

**Output (Human - with tasks)**:
```
ID  Status     Description
1   [x]        Buy groceries
2   [ ]        Call mom
3   [ ]        Finish report

3 tasks (1 completed, 2 pending)
```

**Output (Human - empty)**:
```
No tasks yet. Add one with: todo add "your task"
```

**Output (JSON)**:
```json
{
  "success": true,
  "tasks": [
    {
      "id": 1,
      "description": "Buy groceries",
      "status": "completed",
      "createdAt": "2026-01-03T10:00:00.000Z"
    }
  ],
  "summary": {
    "total": 1,
    "completed": 1,
    "pending": 0
  }
}
```

---

### `todo complete <id>`

Mark a task as completed.

**Arguments**:
| Argument | Required | Description |
|----------|----------|-------------|
| id | Yes | Numeric ID of task to complete |

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | Task completed successfully |
| 1 | Task not found or invalid ID |
| 2 | Storage error |

**Output (Human)**:
```
Completed task #1: Buy groceries
```

**Output (Human - already completed)**:
```
Task #1 is already completed
```

**Output (JSON)**:
```json
{
  "success": true,
  "task": {
    "id": 1,
    "description": "Buy groceries",
    "status": "completed",
    "createdAt": "2026-01-03T10:00:00.000Z"
  },
  "alreadyCompleted": false
}
```

**Error Output (Human)**:
```
Error: Task #99 not found
```

**Error Output (JSON)**:
```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task #99 not found"
  }
}
```

---

### `todo delete <id>`

Remove a task from the list.

**Arguments**:
| Argument | Required | Description |
|----------|----------|-------------|
| id | Yes | Numeric ID of task to delete |

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | Task deleted successfully |
| 1 | Task not found or invalid ID |
| 2 | Storage error |

**Output (Human)**:
```
Deleted task #2: Call mom
```

**Output (JSON)**:
```json
{
  "success": true,
  "task": {
    "id": 2,
    "description": "Call mom",
    "status": "pending",
    "createdAt": "2026-01-03T10:05:00.000Z"
  }
}
```

**Error Output (Human)**:
```
Error: Task #99 not found
```

---

## Error Codes Reference

| Code | Constant | Description |
|------|----------|-------------|
| EMPTY_DESCRIPTION | User provided empty task description |
| TASK_NOT_FOUND | Task ID does not exist |
| INVALID_ID | Task ID is not a valid number |
| STORAGE_CORRUPTED | Storage file has invalid JSON or schema |
| STORAGE_ACCESS | Cannot read/write storage file |

## Stdin/Stdout/Stderr

| Stream | Usage |
|--------|-------|
| stdin | Not used (arguments only) |
| stdout | Command output (human or JSON) |
| stderr | Error messages, verbose logs |

## Composability Examples

```bash
# Add task and capture ID
ID=$(todo add "New task" --json | jq '.task.id')

# List pending tasks as JSON for processing
todo list --pending --json | jq '.tasks[].description'

# Complete all pending tasks (scripted)
todo list --pending --json | jq -r '.tasks[].id' | xargs -I {} todo complete {}

# Check if any tasks exist
if todo list --json | jq -e '.tasks | length > 0' > /dev/null; then
  echo "You have tasks!"
fi
```
