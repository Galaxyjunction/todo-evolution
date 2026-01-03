import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createTask, completeTask, deleteTask } from '../../src/lib/task.js';
import { EmptyDescriptionError, TaskNotFoundError } from '../../src/lib/errors.js';

describe('task operations', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `todo-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    const todoPath = join(testDir, '.todo');
    if (existsSync(todoPath)) {
      unlinkSync(todoPath);
    }
  });

  describe('createTask', () => {
    it('should create a task with valid description', async () => {
      const task = await createTask('Buy groceries');

      expect(task.id).toBe(1);
      expect(task.description).toBe('Buy groceries');
      expect(task.status).toBe('pending');
      expect(task.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should assign incrementing IDs', async () => {
      const task1 = await createTask('Task 1');
      const task2 = await createTask('Task 2');
      const task3 = await createTask('Task 3');

      expect(task1.id).toBe(1);
      expect(task2.id).toBe(2);
      expect(task3.id).toBe(3);
    });

    it('should throw EmptyDescriptionError for empty string', async () => {
      await expect(createTask('')).rejects.toThrow(EmptyDescriptionError);
    });

    it('should throw EmptyDescriptionError for whitespace-only string', async () => {
      await expect(createTask('   ')).rejects.toThrow(EmptyDescriptionError);
      await expect(createTask('\t\n')).rejects.toThrow(EmptyDescriptionError);
    });

    it('should preserve special characters in description', async () => {
      const task = await createTask('Test "quotes" and unicode: 日本語 🎉');

      expect(task.description).toBe('Test "quotes" and unicode: 日本語 🎉');
    });

    it('should trim leading/trailing whitespace from description', async () => {
      const task = await createTask('  trimmed description  ');

      expect(task.description).toBe('trimmed description');
    });
  });

  describe('completeTask', () => {
    it('should mark a pending task as completed', async () => {
      await createTask('Test task');

      const result = await completeTask(1);

      expect(result.task.status).toBe('completed');
      expect(result.alreadyCompleted).toBe(false);
    });

    it('should return alreadyCompleted=true for completed task', async () => {
      await createTask('Test task');
      await completeTask(1);

      const result = await completeTask(1);

      expect(result.task.status).toBe('completed');
      expect(result.alreadyCompleted).toBe(true);
    });

    it('should throw TaskNotFoundError for non-existent ID', async () => {
      await expect(completeTask(999)).rejects.toThrow(TaskNotFoundError);
    });
  });

  describe('deleteTask', () => {
    it('should remove a task from the store', async () => {
      const task = await createTask('Test task');

      const deleted = await deleteTask(task.id);

      expect(deleted.id).toBe(task.id);
      expect(deleted.description).toBe('Test task');
    });

    it('should throw TaskNotFoundError for non-existent ID', async () => {
      await expect(deleteTask(999)).rejects.toThrow(TaskNotFoundError);
    });

    it('should delete completed tasks', async () => {
      await createTask('Test task');
      await completeTask(1);

      const deleted = await deleteTask(1);

      expect(deleted.status).toBe('completed');
    });
  });
});
