import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { mkdirSync, existsSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('todo list command', () => {
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

  it('should show empty list message when no tasks', () => {
    const result = runCli('list');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('No tasks yet');
    expect(result.stdout).toContain('todo add');
  });

  it('should list all tasks with ID, status, and description', () => {
    createTaskStore([
      { id: 1, description: 'Buy groceries', status: 'pending' },
      { id: 2, description: 'Call mom', status: 'completed' },
    ]);

    const result = runCli('list');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Buy groceries');
    expect(result.stdout).toContain('Call mom');
    expect(result.stdout).toContain('[ ]');
    expect(result.stdout).toContain('[x]');
  });

  it('should show summary with task counts', () => {
    createTaskStore([
      { id: 1, description: 'Task 1', status: 'pending' },
      { id: 2, description: 'Task 2', status: 'completed' },
      { id: 3, description: 'Task 3', status: 'pending' },
    ]);

    const result = runCli('list');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('3 tasks');
    expect(result.stdout).toContain('1 completed');
    expect(result.stdout).toContain('2 pending');
  });

  it('should filter pending tasks with --pending flag', () => {
    createTaskStore([
      { id: 1, description: 'Pending task', status: 'pending' },
      { id: 2, description: 'Completed task', status: 'completed' },
    ]);

    const result = runCli('list --pending');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Pending task');
    expect(result.stdout).not.toContain('Completed task');
  });

  it('should filter completed tasks with --completed flag', () => {
    createTaskStore([
      { id: 1, description: 'Pending task', status: 'pending' },
      { id: 2, description: 'Completed task', status: 'completed' },
    ]);

    const result = runCli('list --completed');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).not.toContain('Pending task');
    expect(result.stdout).toContain('Completed task');
  });

  it('should output JSON with --json flag', () => {
    createTaskStore([{ id: 1, description: 'Test task', status: 'pending' }]);

    const result = runCli('list --json');

    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.success).toBe(true);
    expect(output.tasks).toHaveLength(1);
    expect(output.tasks[0].description).toBe('Test task');
    expect(output.summary.total).toBe(1);
    expect(output.summary.pending).toBe(1);
    expect(output.summary.completed).toBe(0);
  });

  it('should output empty JSON array when no tasks', () => {
    const result = runCli('list --json');

    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.success).toBe(true);
    expect(output.tasks).toHaveLength(0);
    expect(output.summary.total).toBe(0);
  });
});
