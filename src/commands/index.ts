#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { addCommand } from './add.js';
import { listCommand } from './list.js';
import { completeCommand } from './complete.js';
import { deleteCommand } from './delete.js';

// Get package.json for version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', '..', 'package.json');

let version = '0.1.0';
try {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { version: string };
  version = packageJson.version;
} catch {
  // Use default version if package.json can't be read
}

const program = new Command();

program
  .name('todo')
  .description('A CLI-based task management system')
  .version(version, '-V, --version', 'Display version number')
  .option('--json', 'Output in JSON format')
  .option('-v, --verbose', 'Enable verbose output');

// Register commands
program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(completeCommand);
program.addCommand(deleteCommand);

export { program };

// Only run if this is the main module
const isMain = process.argv[1]?.includes('index') ?? false;
if (isMain) {
  program.parse();
}
