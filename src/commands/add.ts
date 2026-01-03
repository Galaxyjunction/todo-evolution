import { Command } from 'commander';
import { createTask } from '../lib/task.js';
import { EmptyDescriptionError, StorageAccessError } from '../lib/errors.js';
import { formatTaskCreated, formatError, formatJson } from '../utils/output.js';

export const addCommand = new Command('add')
  .description('Add a new task to the todo list')
  .argument('<description>', 'Text description of the task')
  .action(async (description: string, _options: unknown, command: Command) => {
    const parentOpts = command.parent?.opts() as { json?: boolean } | undefined;
    const isJson = parentOpts?.json ?? false;

    try {
      const task = await createTask(description);

      if (isJson) {
        console.log(formatJson({ success: true, task }));
      } else {
        console.log(formatTaskCreated(task));
      }

      process.exitCode = 0;
    } catch (error) {
      if (error instanceof EmptyDescriptionError) {
        if (isJson) {
          console.log(
            formatJson({
              success: false,
              error: {
                code: 'EMPTY_DESCRIPTION',
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
