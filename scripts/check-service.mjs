import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { radioEndpoint, radioMediaUrl, readRadioState } from '../js/radio-client.mjs';

export async function checkService({ workerUrl, origin, fetchImpl = fetch }) {
  const worker = new URL(workerUrl);
  const host = new URL(origin);
  for (const url of [worker, host]) {
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
      throw new Error('HTTPS required outside loopback development');
    }
    if (url.username || url.password || url.search || url.hash) throw new Error('Public credential-free URLs required');
  }
  if (host.origin !== origin) throw new Error('Supply an exact host origin without path or trailing slash');
  const radioUrl = radioEndpoint(workerUrl);
  const request = (url, options = {}) => fetchImpl(url, { ...options, signal: AbortSignal.timeout(15000) });
  const cors = (response, exact = false) => {
    const allowed = response.headers.get('access-control-allow-origin');
    if (allowed !== origin && (exact || allowed !== '*')) throw new Error('Worker did not allow the requested host origin');
  };
  const preflight = await request(`${radioUrl}/vote`, {
    method: 'OPTIONS',
    headers: { origin, 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' },
  });
  if (!preflight.ok) throw new Error(`Vote preflight HTTP ${preflight.status}`);
  cors(preflight, true);
  const methods = (preflight.headers.get('access-control-allow-methods') || '').toUpperCase().split(',').map(value => value.trim());
  const headers = (preflight.headers.get('access-control-allow-headers') || '').toLowerCase().split(',').map(value => value.trim());
  if (!methods.includes('POST') || !headers.includes('content-type')) throw new Error('Vote preflight is missing POST/content-type');
  const state = await readRadioState({
    radioUrl,
    fetchImpl: async (url, options) => {
      const response = await request(url, { ...options, headers: { origin } });
      cors(response);
      return response;
    },
  });
  if (state.playback?.ready !== true || !state.nowPlaying?.playId) throw new Error('Radio is not currently playing; retry when audible');
  const history = await request(`${radioUrl}/history?weeks=1&calendar=new-york`, { headers: { origin } });
  if (!history.ok) throw new Error(`History HTTP ${history.status}`);
  cors(history);
  const weeks = (await history.json()).weeks;
  if (!Array.isArray(weeks) || !weeks.some(week => week.current && Array.isArray(week.tracks))) {
    throw new Error('Current weekly vote history unavailable');
  }
  const mediaUrl = radioMediaUrl(radioUrl, state.nowPlaying.ipfsCid);
  if (!mediaUrl) throw new Error('Current radio recording has no valid media CID');
  const media = await request(mediaUrl, { headers: { origin, range: 'bytes=0-1023' } });
  try {
    cors(media);
    if (media.status !== 206 || !/^bytes 0-\d+\/\d+$/.test(media.headers.get('content-range') || '')) {
      throw new Error(`Media byte-range check failed (HTTP ${media.status})`);
    }
  } finally {
    await media.body?.cancel();
  }
  return { origin, workerUrl, playId: state.nowPlaying.playId, checks: ['vote preflight', 'radio state', 'weekly history', 'media byte ranges'], voteSubmitted: false };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [workerUrl, origin] = process.argv.slice(2);
  if (!workerUrl || !origin) throw new Error('Usage: node scripts/check-service.mjs WORKER_URL HOST_ORIGIN');
  console.log(JSON.stringify(await checkService({ workerUrl, origin }), null, 2));
}
