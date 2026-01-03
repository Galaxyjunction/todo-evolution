import type { Task, TaskResult, ListResult, ErrorResult, OutputFormat } from '../models/types.js';
import { getErrorCode, getErrorMessage } from '../lib/errors.js';

/**
 * Format a task result for output
 */
export function formatTaskResult(
  result: TaskResult,
  format: OutputFormat,
  action: 'Created' | 'Completed' | 'Deleted'
): string {
  if (format === 'json') {
    return JSON.stringify(result, null, 2);
  }

  if (action === 'Completed' && result.alreadyCompleted === true) {
    return `Task #${result.task.id} is already completed`;
  }

  return `${action} task #${result.task.id}: ${result.task.description}`;
}

/**
 * Format a list result for output
 */
export function formatListResult(result: ListResult, format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(result, null, 2);
  }

  if (result.tasks.length === 0) {
    return 'No tasks yet. Add one with: todo add "your task"';
  }

  const lines: string[] = [];

  // Header
  lines.push('ID  Status     Description');

  // Tasks
  for (const task of result.tasks) {
    const status = task.status === 'completed' ? '[x]' : '[ ]';
    const id = String(task.id).padEnd(3);
    lines.push(`${id} ${status.padEnd(10)} ${task.description}`);
  }

  // Summary
  lines.push('');
  lines.push(
    `${result.summary.total} task${result.summary.total === 1 ? '' : 's'} ` +
      `(${result.summary.completed} completed, ${result.summary.pending} pending)`
  );

  return lines.join('\n');
}

/**
 * Format an error result for output
 */
export function formatErrorResult(error: unknown, format: OutputFormat): string {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  if (format === 'json') {
    const result: ErrorResult = {
      success: false,
      error: { code, message },
    };
    return JSON.stringify(result, null, 2);
  }

  return `Error: ${message}`;
}

/**
 * Format a single task for JSON output (used in add/complete/delete)
 */
export function taskToJson(task: Task): string {
  return JSON.stringify(task, null, 2);
}

/**
 * Verbose logging utility (writes to stderr)
 */
export function verbose(message: string, enabled: boolean): void {
  if (enabled) {
    console.error(`[verbose] ${message}`);
  }
}

/**
 * Format a created task message
 */
export function formatTaskCreated(task: Task): string {
  return `Created task #${task.id}: ${task.description}`;
}

/**
 * Format a completed task message
 */
export function formatTaskCompleted(task: Task, alreadyCompleted: boolean): string {
  if (alreadyCompleted) {
    return `Task #${task.id} is already completed`;
  }
  return `Completed task #${task.id}: ${task.description}`;
}

/**
 * Format a deleted task message
 */
export function formatTaskDeleted(task: Task): string {
  return `Deleted task #${task.id}: ${task.description}`;
}

/**
 * Format an error message
 */
export function formatError(message: string): string {
  return `Error: ${message}`;
}

/**
 * Format any object as JSON
 */
export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
