import { readFile, writeFile, rename } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import lockfile from 'proper-lockfile';
import type { TaskStore } from '../models/types.js';
import { StorageCorruptedError, StorageAccessError } from './errors.js';

const STORAGE_FILENAME = '.todo';
const CURRENT_VERSION = 1;

/**
 * Get the path to the storage file in the current working directory
 */
export function getStorePath(): string {
  return join(process.cwd(), STORAGE_FILENAME);
}

/**
 * Create an empty task store with default values
 */
export function createEmptyStore(): TaskStore {
  return {
    version: CURRENT_VERSION,
    nextId: 1,
    tasks: [],
  };
}

/**
 * Validate that a parsed object is a valid TaskStore
 */
function validateStore(data: unknown): TaskStore {
  if (typeof data !== 'object' || data === null) {
    throw new StorageCorruptedError('Invalid data format');
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== 'number') {
    throw new StorageCorruptedError('Missing or invalid version field');
  }

  if (obj.version !== CURRENT_VERSION) {
    throw new StorageCorruptedError(`Unsupported version: ${obj.version}`);
  }

  if (typeof obj.nextId !== 'number') {
    throw new StorageCorruptedError('Missing or invalid nextId field');
  }

  if (!Array.isArray(obj.tasks)) {
    throw new StorageCorruptedError('Missing or invalid tasks field');
  }

  // Validate each task
  for (const task of obj.tasks) {
    if (typeof task !== 'object' || task === null) {
      throw new StorageCorruptedError('Invalid task format');
    }
    const t = task as Record<string, unknown>;
    if (typeof t.id !== 'number' || typeof t.description !== 'string' ||
        (t.status !== 'pending' && t.status !== 'completed') ||
        typeof t.createdAt !== 'string') {
      throw new StorageCorruptedError('Invalid task fields');
    }
  }

  return obj as unknown as TaskStore;
}

/**
 * Load the task store from disk
 * Returns an empty store if the file doesn't exist
 */
export async function loadStore(): Promise<TaskStore> {
  const storePath = getStorePath();

  if (!existsSync(storePath)) {
    return createEmptyStore();
  }

  try {
    const content = await readFile(storePath, 'utf-8');
    let data: unknown;

    try {
      data = JSON.parse(content);
    } catch {
      throw new StorageCorruptedError('Invalid JSON format');
    }

    return validateStore(data);
  } catch (error) {
    if (error instanceof StorageCorruptedError) {
      throw error;
    }
    throw new StorageAccessError('read', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Save the task store to disk using atomic write
 * Uses a temporary file and rename for crash safety
 */
export async function saveStore(store: TaskStore): Promise<void> {
  const storePath = getStorePath();
  const tempPath = `${storePath}.tmp`;
  const content = JSON.stringify(store, null, 2);

  let release: (() => Promise<void>) | undefined;

  try {
    // Try to acquire lock if file exists
    if (existsSync(storePath)) {
      try {
        release = await lockfile.lock(storePath, {
          stale: 5000,
          retries: {
            retries: 3,
            factor: 2,
            minTimeout: 100,
            maxTimeout: 1000,
          },
        });
      } catch {
        // If locking fails, proceed anyway (single-user assumption)
        // In verbose mode, we'd log a warning here
      }
    }

    // Write to temp file first
    await writeFile(tempPath, content, 'utf-8');

    // Atomic rename
    await rename(tempPath, storePath);
  } catch (error) {
    throw new StorageAccessError('write', error instanceof Error ? error.message : String(error));
  } finally {
    if (release) {
      try {
        await release();
      } catch {
        // Ignore unlock errors
      }
    }
  }
}

/**
 * Load store, apply a mutation, and save atomically
 */
export async function withStore<T>(
  mutate: (store: TaskStore) => T
): Promise<{ store: TaskStore; result: T }> {
  const store = await loadStore();
  const result = mutate(store);
  await saveStore(store);
  return { store, result };
}
