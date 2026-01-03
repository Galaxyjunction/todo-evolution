import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { mkdirSync, existsSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('todo add command', () => {
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

  it('should add a task with valid description', () => {
    const result = runCli('add "Buy groceries"');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Created task #1');
    expect(result.stdout).toContain('Buy groceries');
  });

  it('should create .todo file on first add', () => {
    runCli('add "First task"');

    const todoPath = join(testDir, '.todo');
    expect(existsSync(todoPath)).toBe(true);

    const content = JSON.parse(readFileSync(todoPath, 'utf-8'));
    expect(content.tasks).toHaveLength(1);
    expect(content.tasks[0].description).toBe('First task');
  });

  it('should assign incrementing IDs', () => {
    runCli('add "Task 1"');
    runCli('add "Task 2"');
    const result = runCli('add "Task 3"');

    expect(result.stdout).toContain('Created task #3');
  });

  it('should fail with empty description', () => {
    const result = runCli('add ""');

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('empty');
  });

  it('should output JSON with --json flag', () => {
    const result = runCli('add "Test task" --json');

    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.success).toBe(true);
    expect(output.task.description).toBe('Test task');
    expect(output.task.status).toBe('pending');
  });

  it('should preserve special characters', () => {
    const result = runCli('add "Test with \\"quotes\\" and emoji 🎉"');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('quotes');
  });
});
