import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { verifyUpstream } from '../scripts/verify-upstream.mjs';
import { checkService } from '../scripts/check-service.mjs';

test('release inventory verifies actual frozen bytes', async () => {
  const result = await verifyUpstream();
  assert.equal(result.files, 8);
  assert.equal(result.commit, '948289670ed43678ea0dcaeafd8ea487bd78a2b0');
});

test('product root mounts the actual widget and supporter workflows share an immutable kit pin', async () => {
  const root = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(root, /import \{ mount \} from '\.\/widget\.js'/);
  assert.match(root, /radio\.destroy\(\)/);
  assert.match(root, /theme: 'dark'/);
  assert.match(root, /#radio::part\(play\)/);
  assert.match(root, /<svg[^>]+aria-hidden="true"/);
  assert.match(root, /decorative, not a live audio meter/);
  assert.doesNotMatch(root, /autoplay|\.play\(\)/);
  const pin = 'a0f3bdebcbb5ded8437446797fcba28272af8098';
  for (const name of ['release', 'announce']) {
    const workflow = await readFile(new URL(`../.github/workflows/supporter-${name}.yml`, import.meta.url), 'utf8');
    assert.match(workflow, new RegExp(`uses: TheJollyLaMa/DecentHead/.github/workflows/product-supporter-\\w+\\.yml@${pin}`));
    assert.match(workflow, new RegExp(`head_ref: ${pin}`));
    assert.doesNotMatch(workflow, /PRIVATE_KEY/);
    if (name === 'announce') assert.match(workflow, /SUPPORTER_DISCORD_ENABLED == 'true'/);
    if (name === 'release') assert.match(workflow, /quantity: '100'/);
  }
});

test('release inventory rejects altered bytes and paths outside the product', async t => {
  const root = await mkdtemp(join(tmpdir(), 'dbusk-release-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const content = 'reviewed module\n';
  await mkdir(join(root, 'widget'));
  await writeFile(join(root, 'widget', 'entry.js'), content);
  const lock = {
    freezeCommit: 'a'.repeat(40), files: ['widget/entry.js'],
    sha256: { 'widget/entry.js': createHash('sha256').update(content).digest('hex') },
  };
  const save = () => writeFile(join(root, 'upstream.json'), JSON.stringify(lock));
  await save();
  assert.equal((await verifyUpstream(root)).files, 1);
  await writeFile(join(root, 'widget', 'entry.js'), 'modified');
  await assert.rejects(verifyUpstream(root), /hash mismatch/);
  lock.files = ['../outside.js'];
  lock.sha256 = { '../outside.js': 'b'.repeat(64) };
  await save();
  await assert.rejects(verifyUpstream(root), /Invalid inventory path/);
});

function service({ preflightOrigin = 'https://host.example', ready = true, rangeStatus = 206, history = true,
  range = 'bytes 0-1023/5000', size = 1024, type = 'audio/mpeg' } = {}) {
  const calls = [];
  const origin = 'https://host.example';
  const fetchImpl = async (url, options) => {
    calls.push({ url, method: options.method || 'GET', headers: options.headers });
    assert.notEqual(options.method, 'POST');
    if (options.method === 'OPTIONS') return new Response(null, {
      status: 204,
      headers: { 'access-control-allow-origin': preflightOrigin, 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type, range' },
    });
    const headers = { 'access-control-allow-origin': '*' };
    if (url.includes('/media?')) return new Response(new Uint8Array(size), {
      status: rangeStatus, headers: { ...headers, 'content-range': range, 'content-type': type },
    });
    if (url.includes('/history?')) return Response.json({ weeks: history ? [{ current: true, tracks: [] }] : [] }, { headers });
    return Response.json({
      playback: { ready }, nowPlaying: { playId: 'play-1', ipfsCid: 'bafy' + 'a'.repeat(55) },
    }, { headers });
  };
  return { calls, options: { workerUrl: 'https://worker.example', origin, fetchImpl } };
}

test('service preflight checks reads and ranges without writing a vote', async () => {
  const fake = service();
  const result = await checkService(fake.options);
  assert.equal(result.voteSubmitted, false);
  assert.equal(fake.calls.length, 4);
  assert.deepEqual(fake.calls.map(call => call.method), ['OPTIONS', 'GET', 'GET', 'GET']);
  assert.equal(fake.calls[3].headers.range, 'bytes=0-1023');
});

test('service check fails closed on wildcard write origin, idle radio, missing history and absent range support', async () => {
  await assert.rejects(checkService(service({ preflightOrigin: '*' }).options), /host origin/);
  await assert.rejects(checkService(service({ ready: false }).options), /not currently playing/);
  await assert.rejects(checkService(service({ history: false }).options), /weekly vote history/);
  await assert.rejects(checkService(service({ rangeStatus: 200 }).options), /byte-range check failed/);
});

test('media probe rejects malformed ranges, error bodies, truncation and excess bytes', async () => {
  await assert.rejects(checkService(service({ range: 'bytes 0-2047/5000' }).options), /byte-range check failed/);
  await assert.rejects(checkService(service({ type: 'application/json' }).options), /content type/);
  await assert.rejects(checkService(service({ size: 100 }).options), /truncated/);
  await assert.rejects(checkService(service({ size: 2048 }).options), /exceeds requested/);
  assert.equal((await checkService(service({ range: 'bytes 0-7/8', size: 8 }).options)).voteSubmitted, false);
});

test('service check rejects insecure and credential-bearing deployment inputs before fetching', async () => {
  const fake = service();
  for (const workerUrl of ['http://worker.example', 'https://user:password@worker.example', 'https://worker.example?secret=value']) {
    await assert.rejects(checkService({ ...fake.options, workerUrl }), /HTTPS required|credential-free/);
  }
  await assert.rejects(checkService({ ...fake.options, origin: 'https://host.example/path' }), /exact host origin/);
  assert.equal(fake.calls.length, 0);
});
