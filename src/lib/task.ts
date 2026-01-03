import type { Task } from '../models/types.js';
import { EmptyDescriptionError, TaskNotFoundError } from './errors.js';
import { withStore, loadStore, saveStore } from './storage.js';

/**
 * Create a new task with the given description
 * @param description - The task description (will be trimmed)
 * @returns The created task
 * @throws EmptyDescriptionError if description is empty or whitespace-only
 */
export async function createTask(description: string): Promise<Task> {
  const trimmed = description.trim();

  if (trimmed.length === 0) {
    throw new EmptyDescriptionError();
  }

  const { result } = await withStore((store) => {
    const task: Task = {
      id: store.nextId,
      description: trimmed,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    store.tasks.push(task);
    store.nextId++;

    return task;
  });

  return result;
}

/**
 * Mark a task as completed
 * @param id - The task ID to complete
 * @returns Object containing the task and whether it was already completed
 * @throws TaskNotFoundError if task with given ID doesn't exist
 */
export async function completeTask(
  id: number
): Promise<{ task: Task; alreadyCompleted: boolean }> {
  const store = await loadStore();
  const task = store.tasks.find((t) => t.id === id);

  if (!task) {
    throw new TaskNotFoundError(id);
  }

  const alreadyCompleted = task.status === 'completed';

  if (!alreadyCompleted) {
    task.status = 'completed';
    await saveStore(store);
  }

  return { task, alreadyCompleted };
}

/**
 * Delete a task by ID
 * @param id - The task ID to delete
 * @returns The deleted task
 * @throws TaskNotFoundError if task with given ID doesn't exist
 */
export async function deleteTask(id: number): Promise<Task> {
  const store = await loadStore();
  const taskIndex = store.tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    throw new TaskNotFoundError(id);
  }

  const [deletedTask] = store.tasks.splice(taskIndex, 1);
  await saveStore(store);

  return deletedTask as Task;
}
