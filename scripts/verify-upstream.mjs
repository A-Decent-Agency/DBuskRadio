import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative, isAbsolute } from 'node:path';

export async function verifyUpstream(root = fileURLToPath(new URL('../', import.meta.url))) {
  const lock = JSON.parse(await readFile(resolve(root, 'upstream.json'), 'utf8'));
  if (!/^[a-f0-9]{40}$/.test(lock.freezeCommit || '')) throw new Error('Full upstream commit required');
  if (!Array.isArray(lock.files) || !lock.files.length || new Set(lock.files).size !== lock.files.length) {
    throw new Error('Nonempty, unique upstream file inventory required');
  }
  if (Object.keys(lock.sha256 || {}).length !== lock.files.length) throw new Error('Hash inventory differs from file inventory');
  for (const name of lock.files) {
    if (typeof name !== 'string') throw new Error('Invalid inventory path');
    const file = resolve(root, name);
    const path = relative(root, file);
    if (!path || path.startsWith('..') || isAbsolute(path)) throw new Error(`Invalid inventory path: ${name}`);
    const actual = createHash('sha256').update(await readFile(file)).digest('hex');
    if (!/^[a-f0-9]{64}$/.test(lock.sha256[name] || '') || actual !== lock.sha256[name]) {
      throw new Error(`Upstream hash mismatch: ${name}`);
    }
  }
  return { commit: lock.freezeCommit, files: lock.files.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await verifyUpstream();
  console.log(`Verified ${result.files} frozen files at ${result.commit}`);
}
