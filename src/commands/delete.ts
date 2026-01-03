import { Command } from 'commander';
import { deleteTask } from '../lib/task.js';
import { TaskNotFoundError, StorageAccessError } from '../lib/errors.js';
import { formatTaskDeleted, formatError, formatJson } from '../utils/output.js';

export const deleteCommand = new Command('delete')
  .description('Remove a task from the list')
  .argument('<id>', 'Numeric ID of task to delete')
  .action(async (idArg: string, _options: unknown, command: Command) => {
    const parentOpts = command.parent?.opts() as { json?: boolean } | undefined;
    const isJson = parentOpts?.json ?? false;

    // Validate ID format
    const id = parseInt(idArg, 10);
    if (isNaN(id) || id <= 0) {
      if (isJson) {
        console.log(
          formatJson({
            success: false,
            error: {
              code: 'INVALID_ID',
              message: `Task ID must be a positive number, got: ${idArg}`,
            },
          })
        );
      } else {
        console.error(formatError(`Task ID must be a positive number, got: ${idArg} (invalid)`));
      }
      process.exitCode = 1;
      return;
    }

    try {
      const task = await deleteTask(id);

      if (isJson) {
        console.log(
          formatJson({
            success: true,
            task,
          })
        );
      } else {
        console.log(formatTaskDeleted(task));
      }

      process.exitCode = 0;
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        if (isJson) {
          console.log(
            formatJson({
              success: false,
              error: {
                code: 'TASK_NOT_FOUND',
                message: error.message,
              },
            })
          );
        } else {
          console.error(formatError(error.message));
        }
        process.exitCode = 1;
      } else if (error instanceof StorageAccessError) {
        if (isJson) {
          console.log(
            formatJson({
              success: false,
              error: {
                code: 'STORAGE_ACCESS',
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
