import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { mkdirSync, existsSync, unlinkSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('todo complete command', () => {
  let testDir: string;
  let cliPath: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `todo-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
    cliPath = join(process.cwd(), 'dist', 'commands', 'index.js');
  });

  afterEach(() => {
    const todoPath = join(testDir, '.todo');
    if (existsSync(todoPath)) {
      unlinkSync(todoPath);
    }
  });

  function runCli(args: string): { stdout: string; stderr: string; exitCode: number } {
    try {
      const stdout = execSync(`node "${cliPath}" ${args}`, {
        cwd: testDir,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return { stdout: stdout.trim(), stderr: '', exitCode: 0 };
    } catch (error: unknown) {
      const e = error as { stdout?: string; stderr?: string; status?: number };
      return {
        stdout: (e.stdout ?? '').trim(),
        stderr: (e.stderr ?? '').trim(),
        exitCode: e.status ?? 1,
      };
    }
  }

  function createTaskStore(tasks: Array<{ id: number; description: string; status: string }>) {
    const store = {
      version: 1,
      nextId: tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
      tasks: tasks.map((t) => ({
        ...t,
        createdAt: new Date().toISOString(),
      })),
    };
    writeFileSync(join(testDir, '.todo'), JSON.stringify(store, null, 2));
  }

  function readTaskStore() {
    return JSON.parse(readFileSync(join(testDir, '.todo'), 'utf-8'));
  }

  it('should complete a pending task', () => {
    createTaskStore([{ id: 1, description: 'Test task', status: 'pending' }]);

    const result = runCli('complete 1');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Completed task #1');
    expect(result.stdout).toContain('Test task');

    const store = readTaskStore();
    expect(store.tasks[0].status).toBe('completed');
  });

  it('should show already completed message', () => {
    createTaskStore([{ id: 1, description: 'Test task', status: 'completed' }]);

    const result = runCli('complete 1');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('already completed');
  });

  it('should fail with task not found error', () => {
    createTaskStore([{ id: 1, description: 'Test task', status: 'pending' }]);

    const result = runCli('complete 999');

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('not found');
  });

  it('should output JSON with --json flag', () => {
    createTaskStore([{ id: 1, description: 'Test task', status: 'pending' }]);

    const result = runCli('complete 1 --json');

    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.success).toBe(true);
    expect(output.task.id).toBe(1);
    expect(output.task.status).toBe('completed');
    expect(output.alreadyCompleted).toBe(false);
  });

  it('should output JSON error for not found', () => {
    const result = runCli('complete 999 --json');

    expect(result.exitCode).toBe(1);
    const output = JSON.parse(result.stdout);
    expect(output.success).toBe(false);
    expect(output.error.code).toBe('TASK_NOT_FOUND');
  });

  it('should fail with invalid ID format', () => {
    const result = runCli('complete abc');

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('invalid');
  });
});
