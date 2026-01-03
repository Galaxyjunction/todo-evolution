import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, unlinkSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { loadStore, saveStore, getStorePath, createEmptyStore } from '../../src/lib/storage.js';
import { StorageCorruptedError } from '../../src/lib/errors.js';
import type { TaskStore } from '../../src/models/types.js';

describe('storage', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    // Create a unique temp directory for each test
    testDir = join(tmpdir(), `todo-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    // Clean up test files
    const todoPath = join(testDir, '.todo');
    if (existsSync(todoPath)) {
      unlinkSync(todoPath);
    }
  });

  describe('getStorePath', () => {
    it('should return .todo in current working directory', () => {
      const path = getStorePath();
      expect(path).toBe(join(testDir, '.todo'));
    });
  });

  describe('createEmptyStore', () => {
    it('should create a store with version 1, nextId 1, and empty tasks array', () => {
      const store = createEmptyStore();
      expect(store.version).toBe(1);
      expect(store.nextId).toBe(1);
      expect(store.tasks).toEqual([]);
    });
  });

  describe('loadStore', () => {
    it('should return empty store when file does not exist', async () => {
      const store = await loadStore();
      expect(store.version).toBe(1);
      expect(store.nextId).toBe(1);
      expect(store.tasks).toEqual([]);
    });

    it('should load existing store from file', async () => {
      const existingStore: TaskStore = {
        version: 1,
        nextId: 3,
        tasks: [
          { id: 1, description: 'Task 1', status: 'pending', createdAt: '2026-01-01T00:00:00.000Z' },
          { id: 2, description: 'Task 2', status: 'completed', createdAt: '2026-01-02T00:00:00.000Z' },
        ],
      };
      writeFileSync(join(testDir, '.todo'), JSON.stringify(existingStore, null, 2));

      const store = await loadStore();
      expect(store.version).toBe(1);
      expect(store.nextId).toBe(3);
      expect(store.tasks).toHaveLength(2);
      expect(store.tasks[0]?.description).toBe('Task 1');
    });

    it('should throw StorageCorruptedError for invalid JSON', async () => {
      writeFileSync(join(testDir, '.todo'), 'not valid json {{{');

      await expect(loadStore()).rejects.toThrow(StorageCorruptedError);
    });

    it('should throw StorageCorruptedError for missing required fields', async () => {
      writeFileSync(join(testDir, '.todo'), JSON.stringify({ version: 1 }));

      await expect(loadStore()).rejects.toThrow(StorageCorruptedError);
    });

    it('should throw StorageCorruptedError for wrong version', async () => {
      writeFileSync(join(testDir, '.todo'), JSON.stringify({ version: 999, nextId: 1, tasks: [] }));

      await expect(loadStore()).rejects.toThrow(StorageCorruptedError);
    });
  });

  describe('saveStore', () => {
    it('should save store to file', async () => {
      const store: TaskStore = {
        version: 1,
        nextId: 2,
        tasks: [
          { id: 1, description: 'Test task', status: 'pending', createdAt: '2026-01-01T00:00:00.000Z' },
        ],
      };

      await saveStore(store);

      const todoPath = join(testDir, '.todo');
      expect(existsSync(todoPath)).toBe(true);

      const loaded = await loadStore();
      expect(loaded.nextId).toBe(2);
      expect(loaded.tasks).toHaveLength(1);
    });

    it('should overwrite existing file', async () => {
      const store1: TaskStore = { version: 1, nextId: 1, tasks: [] };
      await saveStore(store1);

      const store2: TaskStore = {
        version: 1,
        nextId: 5,
        tasks: [
          { id: 1, description: 'Updated', status: 'completed', createdAt: '2026-01-01T00:00:00.000Z' },
        ],
      };
      await saveStore(store2);

      const loaded = await loadStore();
      expect(loaded.nextId).toBe(5);
      expect(loaded.tasks[0]?.status).toBe('completed');
    });
  });
});
