import { Command } from 'commander';
import { loadStore } from '../lib/storage.js';
import { StorageAccessError, StorageCorruptedError } from '../lib/errors.js';
import { formatListResult, formatError, formatJson } from '../utils/output.js';
import type { Task } from '../models/types.js';

export const listCommand = new Command('list')
  .description('Display all tasks')
  .option('--all', 'Show all tasks (default)', true)
  .option('--pending', 'Show only pending tasks')
  .option('--completed', 'Show only completed tasks')
  .action(async (options: { all?: boolean; pending?: boolean; completed?: boolean }, command: Command) => {
    const parentOpts = command.parent?.opts() as { json?: boolean } | undefined;
    const isJson = parentOpts?.json ?? false;

    try {
      const store = await loadStore();
      let tasks: Task[] = store.tasks;

      // Apply filters
      if (options.pending) {
        tasks = tasks.filter((t) => t.status === 'pending');
      } else if (options.completed) {
        tasks = tasks.filter((t) => t.status === 'completed');
      }

      // Calculate summary from filtered tasks for display, but use full store for counts
      const allTasks = store.tasks;
      const summary = {
        total: allTasks.length,
        completed: allTasks.filter((t) => t.status === 'completed').length,
        pending: allTasks.filter((t) => t.status === 'pending').length,
      };

      const result = {
        success: true as const,
        tasks,
        summary,
      };

      if (isJson) {
        console.log(formatJson(result));
      } else {
        console.log(formatListResult(result, 'human'));
      }

      process.exitCode = 0;
    } catch (error) {
      if (error instanceof StorageCorruptedError || error instanceof StorageAccessError) {
        if (isJson) {
          console.log(
            formatJson({
              success: false,
              error: {
                code: error instanceof StorageCorruptedError ? 'STORAGE_CORRUPTED' : 'STORAGE_ACCESS',
                message: error.message,
              },
            })
          );
        } else {
          console.error(formatError(error.message));
        }
        process.exitCode = 2;
      } else {
        throw error;
      }
    }
  });
