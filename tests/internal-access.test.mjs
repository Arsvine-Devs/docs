import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const pagePath = join(dirname(fileURLToPath(import.meta.url)), '../app/internal/[[...slug]]/page.tsx');

test('internal page reads the document only after an owner session', () => {
  const source = readFileSync(pagePath, 'utf8');
  const readAt = source.indexOf('readInternalDoc(slug)');
  const gateAt = source.indexOf('if (!session)');
  assert.ok(gateAt >= 0 && readAt > gateAt);
  assert.match(source, /if \(!session\)/);
  assert.match(source, /force-dynamic/);
});

test('internal files are markdown on disk, not imported by the page module', () => {
  const source = readFileSync(pagePath, 'utf8');
  assert.doesNotMatch(source, /content\/internal/);
});
