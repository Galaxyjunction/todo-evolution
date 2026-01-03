# Quickstart: Task Management CLI

**Feature**: 001-task-management
**Date**: 2026-01-03

## Prerequisites

- Node.js 20.x or later (LTS)
- npm or pnpm

## Installation

```bash
# Clone and install
git clone <repo-url>
cd todo-evolution
npm install

# Build
npm run build

# Link globally (optional)
npm link
```

## Basic Usage

### Add a Task

```bash
todo add "Buy groceries"
# Created task #1: Buy groceries

todo add "Call mom"
# Created task #2: Call mom
```

### List Tasks

```bash
todo list
# ID  Status     Description
# 1   [ ]        Buy groceries
# 2   [ ]        Call mom
#
# 2 tasks (0 completed, 2 pending)
```

### Complete a Task

```bash
todo complete 1
# Completed task #1: Buy groceries

todo list
# ID  Status     Description
# 1   [x]        Buy groceries
# 2   [ ]        Call mom
#
# 2 tasks (1 completed, 1 pending)
```

### Delete a Task

```bash
todo delete 2
# Deleted task #2: Call mom
```

## JSON Output

Add `--json` flag to any command for machine-readable output:

```bash
todo list --json
```

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

## Filtering

```bash
# Show only pending tasks
todo list --pending

# Show only completed tasks
todo list --completed
```

## Help

```bash
# General help
todo --help

# Command-specific help
todo add --help
todo list --help
```

## Storage

Tasks are stored in `.todo` file in the current directory. This file is:
- Human-readable JSON
- Portable (copy with your project)
- Safe to version control (optional)

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | User error (invalid input, task not found) |
| 2 | System error (file access issues) |

## Scripting Examples

```bash
# Add task and get ID
ID=$(todo add "New task" --json | jq '.task.id')

# Complete all pending
todo list --pending --json | jq -r '.tasks[].id' | xargs -I {} todo complete {}

# Count pending tasks
PENDING=$(todo list --json | jq '.summary.pending')
echo "You have $PENDING tasks to do"
```

## Development

```bash
# Run tests
npm test

# Run in watch mode
npm run test:watch

# Type check
npm run typecheck

# Lint
npm run lint
```
