/**
 * Task status enumeration
 */
export type TaskStatus = 'pending' | 'completed';

/**
 * Represents a single todo item
 */
export interface Task {
  /** Unique auto-incrementing identifier (never reused) */
  id: number;
  /** Text describing what needs to be done (non-empty) */
  description: string;
  /** Current state of the task */
  status: TaskStatus;
  /** ISO 8601 timestamp when task was created */
  createdAt: string;
}

/**
 * Root storage structure containing all tasks and metadata
 */
export interface TaskStore {
  /** Schema version for future migrations */
  version: number;
  /** Counter for next task ID assignment */
  nextId: number;
  /** Array of all tasks */
  tasks: Task[];
}

/**
 * Output format for CLI commands
 */
export type OutputFormat = 'human' | 'json';

/**
 * CLI global options
 */
export interface GlobalOptions {
  json?: boolean;
  verbose?: boolean;
}

/**
 * Result of a successful task operation
 */
export interface TaskResult {
  success: true;
  task: Task;
  alreadyCompleted?: boolean;
}

/**
 * Result of listing tasks
 */
export interface ListResult {
  success: true;
  tasks: Task[];
  summary: {
    total: number;
    completed: number;
    pending: number;
  };
}

/**
 * Error result for failed operations
 */
export interface ErrorResult {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * Union type for all operation results
 */
export type OperationResult = TaskResult | ListResult | ErrorResult;
