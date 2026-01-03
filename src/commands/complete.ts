import { Command } from 'commander';
import { completeTask } from '../lib/task.js';
import { TaskNotFoundError, StorageAccessError } from '../lib/errors.js';
import { formatTaskCompleted, formatError, formatJson } from '../utils/output.js';

export const completeCommand = new Command('complete')
  .description('Mark a task as completed')
  .argument('<id>', 'Numeric ID of task to complete')
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
      const { task, alreadyCompleted } = await completeTask(id);

      if (isJson) {
        console.log(
          formatJson({
            success: true,
            task,
            alreadyCompleted,
          })
        );
      } else {
        console.log(formatTaskCompleted(task, alreadyCompleted));
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
