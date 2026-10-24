import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

test('complete frozen upstream inventory matches its SHA-256 manifest', () => {
  const root = new URL('../', import.meta.url);
  const provenance = JSON.parse(readFileSync(new URL('upstream.json', root), 'utf8'));
  assert.match(provenance.freezeCommit, /^[0-9a-f]{40}$/);
  assert.deepEqual(Object.keys(provenance.sha256).sort(), [...provenance.files].sort());
  for (const file of provenance.files) {
    const digest = createHash('sha256').update(readFileSync(new URL(file, root))).digest('hex');
    assert.equal(digest, provenance.sha256[file], file);
  }
});
