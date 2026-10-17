import 'server-only';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, normalize, sep } from 'node:path';

const root = join(process.cwd(), 'content', 'internal');

export type InternalDoc = {
  slug: string[];
  title: string;
  body: string;
};

function safePath(slug: string[]) {
  const relative = slug.length === 0 ? 'index.md' : `${slug.join('/')}.md`;
  const full = normalize(join(root, relative));
  const base = normalize(root);
  if (full !== base && !full.startsWith(base + sep)) {
    throw new Error('Invalid internal document path.');
  }
  return full;
}

export function listInternalDocs() {
  const pages: { slug: string[]; title: string }[] = [];
  function walk(dir: string, prefix: string[]) {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        walk(full, [...prefix, name]);
        continue;
      }
      if (!name.endsWith('.md')) continue;
      const stem = name.slice(0, -3);
      const slug = stem === 'index' ? prefix : [...prefix, stem];
      const raw = readFileSync(full, 'utf8');
      const title = raw.match(/^#\s+(.+)$/m)?.[1] ?? stem;
      pages.push({ slug, title });
    }
  }
  walk(root, []);
  return pages;
}

/** Read an internal page. Call only after owner authorization. */
export function readInternalDoc(slug: string[] | undefined): InternalDoc | null {
  const parts = slug ?? [];
  if (parts.some((part) => part === '..' || part.includes('\\'))) return null;
  try {
    const body = readFileSync(safePath(parts), 'utf8');
    const title = body.match(/^#\s+(.+)$/m)?.[1] ?? 'Internal';
    return { slug: parts, title, body };
  } catch {
    return null;
  }
}
