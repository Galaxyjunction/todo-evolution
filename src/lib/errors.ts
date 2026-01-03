/**
 * Base class for todo application errors
 */
export abstract class TodoError extends Error {
  abstract readonly code: string;
  abstract readonly exitCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when a task is not found by ID
 */
export class TaskNotFoundError extends TodoError {
  readonly code = 'TASK_NOT_FOUND';
  readonly exitCode = 1;

  constructor(id: number) {
    super(`Task #${id} not found`);
  }
}

/**
 * Error thrown when task description is empty or whitespace-only
 */
export class EmptyDescriptionError extends TodoError {
  readonly code = 'EMPTY_DESCRIPTION';
  readonly exitCode = 1;

  constructor() {
    super('Task description cannot be empty');
  }
}

/**
 * Error thrown when storage file has invalid JSON or schema
 */
export class StorageCorruptedError extends TodoError {
  readonly code = 'STORAGE_CORRUPTED';
  readonly exitCode = 2;

  constructor(reason: string) {
    super(`Storage file is corrupted: ${reason}`);
  }
}

/**
 * Error thrown when storage file cannot be read or written
 */
export class StorageAccessError extends TodoError {
  readonly code = 'STORAGE_ACCESS';
  readonly exitCode = 2;

  constructor(operation: 'read' | 'write', reason: string) {
    super(`Cannot ${operation} storage file: ${reason}`);
  }
}

/**
 * Error thrown when task ID is not a valid number
 */
export class InvalidIdError extends TodoError {
  readonly code = 'INVALID_ID';
  readonly exitCode = 1;

  constructor(value: string) {
    super(`Invalid task ID: "${value}" is not a valid number`);
  }
}

/**
 * Type guard to check if an error is a TodoError
 */
export function isTodoError(error: unknown): error is TodoError {
  return error instanceof TodoError;
}

/**
 * Get exit code from an error (defaults to 2 for unknown errors)
 */
export function getExitCode(error: unknown): number {
  if (isTodoError(error)) {
    return error.exitCode;
  }
  return 2;
}

/**
 * Get error code from an error (defaults to 'UNKNOWN_ERROR')
 */
export function getErrorCode(error: unknown): string {
  if (isTodoError(error)) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
}

/**
 * Get error message from an error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
