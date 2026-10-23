import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const ROOT = resolve(import.meta.dirname, '../..');
export const read = (relativePath: string): string =>
  readFileSync(resolve(ROOT, relativePath), 'utf8');
