# DBuskRadio

**DBusk.decentagency.eth** — a standalone, plain ES-module radio widget extracted
from [DecentBusking #247](https://github.com/TheJollyLaMa/DecentBusking/issues/247).
No bundler, dependencies, iframe, wallet connection or automatic playback.

See [deployment paths](docs/DEPLOYMENT.md) for hosted-service onboarding,
independent worker setup and the non-writing service check, and
[supporter release](docs/SUPPORTER-RELEASE.md) for the approved terms and
wallet-signature gates. Release/mint preparation is not proof of publication.

## Clone and try

```sh
git clone https://github.com/A-Decent-Agency/DBuskRadio.git
cd DBuskRadio
node --test test/*.test.mjs
node scripts/verify-upstream.mjs
python3 -m http.server 8080
```

The default branch contains the merged product. For production, check out an
actual reviewed release tag or full commit rather than tracking a moving branch.

Open `http://localhost:8080/` for the styled product demo, or
`http://localhost:8080/widget.html` for the minimal embedding example.
The styled root uses only host CSS variables and shadow parts; the reusable
widget and Canopy's original compact renderer are unchanged.
Static HTTP is necessary for ES modules;
`file:` pages are not supported. A network/CORS error is reported, not silently
replaced with mock music. Local playback can use public reads; local **votes**
require the operator to allow the exact local origin in the radio worker.

## Embed

Copy the complete three-module closure, preserving relative paths:

```text
widget.js → widget/radio-widget.js → js/radio-client.mjs
```

```html
<div id="radio"></div>
<script type="module">
  import { mount } from './widget.js';
  const radio = mount(document.getElementById('radio'), {
    workerUrl: 'https://decentbusking.onrender.com',
    compact: true,
    theme: 'auto',
    volume: 0.08,
    stations: [{ id: 'wqxr', label: 'WQXR', url: 'https://stream.wqxr.org/wqxr-web' }],
    // initialStation: 'wqxr', // DBusk is otherwise selected, but never autoplays
  });
  window.addEventListener('pagehide', () => radio.destroy(), { once: true });
</script>
```

`mount` is a named export from both `widget.js` and `widget/radio-widget.js`.
Return value: `{ destroy() }`; destroy is idempotent and remount replaces the
previous instance. The default view has isolated shadow DOM, scoped styles, local
theme/compact settings, stopped-by-default media and its own request lifecycle.
Inherited CSS variables: `--dbusk-color`, `--dbusk-background`, `--dbusk-border`,
`--dbusk-border-width`, `--dbusk-accent`, `--dbusk-padding`, `--dbusk-gap`,
`--dbusk-radius`, `--dbusk-max-width`. Tokens override all theme modes.
Stable `::part()` names: `panel`, `brand`, `controls`, `play`, `station`,
`volume`, `up`, `down`, `net`, `now`, `status`, `settings`, `theme`, `compact`,
`session`, `audio`. Reduced motion is respected; controls have accessible names,
keyboard operation and live status/now-playing announcements. The now-playing
line is horizontally scrollable/focusable without forced motion.

### Host-owned rendering (no product chrome)

Pass `render({ element, document, controls, stations, selectStation })` to opt
out of the default view. Move the provided native controls into the host's
light-DOM markup; the engine keeps all playback, polling, proxy/seek, voting,
rollback/deduplication and identity logic. `controls` uses the part names above.
Do not clone controls, remove their engine listeners or detach `controls.audio`.
Keep accessible control names/focus; optional settings/votes/now-playing may
live inside a discoverable host disclosure. No default styles enter the host.

Return optional `{ update({ station, listening, now, status }), destroy() }`.
`update` runs after engine controls update, including asynchronous status/vote
changes. `destroy` removes your listeners; the engine handles its listeners,
media/requests, subscriptions and DOM removal. Remount is supported, including
switching between default/custom views (an existing shadow uses a slot bridge).
`selectStation(id, { play: true })` starts only after your user gesture;
otherwise it preserves the paused/listening state. Invalid IDs and calls after
destroy are ignored.

```js
mount(host, {
  render({ element, document, controls }) {
    const row = document.createElement('nav');
    row.setAttribute('aria-label', 'Radio');
    row.append(controls.play, controls.station, controls.volume);
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Radio details and voting';
    details.append(summary, controls.now, controls.up, controls.down,
      controls.net, controls.status, controls.session);
    element.replaceChildren(row, details, controls.audio);
  },
});
```

Options may inject `head` for tests; otherwise the widget reuses
`window.DecentHead`, including a late `decenthead:ready` event. It reads
`getWallet().snapshot()` and `getIpfs()`, subscribes only to `head.on('wallet')`,
and unsubscribes on destroy. It does **not** request accounts, connect a wallet,
switch a chain, sign, transact, upload or pin. A second header is never rendered.
Radio voting remains anonymous: the host session display is not wallet
authentication and wallet-bound votes are not claimed.

## Radio behavior and origin configuration

DBusk uses the same `GET /api/radio`, `GET /api/radio/history`,
`GET /api/radio/media?cid=…` and `POST /api/radio/vote` protocol as the source
website. Browser listener ID and the latest 100 per-play choices use the same
`decentbusking:listener:v1` and `decentbusking:votes:v1:<radio-url>` keys.
Storage is origin-scoped; the worker rejects repeated voter-ID/play pairs,
not repeated people across origins. No wallet is sent to this anonymous endpoint.
Votes use optimistic feedback and roll back on errors; successful votes refresh
the real weekly/ad tallies. Voting is disabled while paused, offline, between
tracks, on invalid media, or on external stations. Network/CORS, cooldown,
autoplay rejection and media errors display retry guidance. No test sends real
votes or changes production tallies.

Public reads/media already allow CORS. The associated upstream worker change
introduces `RADIO_ALLOWED_ORIGINS` for **radio voting only**, without expanding
signed/admin/upload permissions. Defaults cover:

- `https://thejollylama.github.io` (Canopy and Busking)
- `https://a-decent-agency.github.io`
- `https://decentcanopy.eth.limo`
- `https://dbusk.decentagency.eth.limo`

IPFS subdomain gateways and other ENS gateways require their actual exact
origin to be added by an operator; no arbitrary wildcard or `null` origin.
The reference worker rollout has been verified for the Agency Pages radio
preflight, public state/history and actual ranged media bytes. Other operators
must configure and verify their own exact origins.

The vote preflight advertises `GET, POST, OPTIONS` and headers
`content-type, range`; the actual write route is `POST /api/radio/vote`.
No credentialed CORS header is added. Missing, `null`, and unlisted Origin
headers are rejected by that worker route, but **Origin/CORS is not
authentication**: a non-browser client can forge an allowed Origin and a new
anonymous voter ID. Current API enforcement validates the vote/ID shape,
requires an audible current play, deduplicates the ID per play, and caps the
per-play ID map at 5,000. It is not wallet-bound or a per-person rate limit.
Abuse protection/authentication/rate-limit changes require a separately reviewed
server policy; this widget does not pretend browser storage provides it.

## Provenance and updating

`upstream.json` freezes **DecentBusking
`2c80b287730f0dd6496520b89fd76debaa6e6b9b`**, including the source integration and per-recording handoff fix, based on main
`045c625f90930263c3f14ca26b520634fe7d76cc`.
This is a merged source snapshot, not a tagged product release. The runtime modules,
demo and widget tests are byte-identical to that commit. Upstream
`js/radio-sync.js` uses the same `radio-client.mjs` transport, listener identity
and media URL helpers, avoiding an independent fork of the client protocol.
Its archive, fade, buffering and Discord takeover player remains separate and
unchanged. Update shared behavior upstream first, then synchronize the complete
closure and `upstream.json` (including per-file SHA-256 inventory) in one reviewed product PR; never patch a product
copy silently or import a mutable upstream branch.

For remote embeds, use this product's **full pushed commit SHA** in an ESM-capable
static CDN URL, e.g. the Canopy adapter committed alongside this work. Do not
replace it with `@main`, an uncreated tag, or a raw GitHub HTML/text response.
Every relative module must remain within the same immutable commit.

## Production and unsigned release gates

1. The upstream extraction, radio-only CORS and per-recording handoff fix are
   merged; the runtime freeze above records their exact source.
2. An authorized operator deploys their worker, verifies actual Canopy,
   ENS and IPFS origins, public media/ranges, and radio-only vote preflight.
3. The product provenance/closure has been checked and merged without rewriting
   its pinned commits. Until a published release exists, use an exact commit.
4. Canopy's host adapter is merged with a publicly retrievable immutable product
   pin and its original compact appearance. For each new deployment, verify the
   pin is retrievable; test live audio/codec, actual CORS, next-track handoff and tallies
   on a dedicated browser page. Synthetic tests do not establish live delivery.
5. Supporter terms are approved: 1,000 editions at 10 USDC, 10% secondary
   royalty, with the personal `thejollylama.eth` wallet handling supporter
   registration/minting, initial editions and royalties. The Agency wallet is
   for ENS only; the proposed Agency NFT-admin grant is withdrawn. The v0.1.0
   assets are frozen, while the improved product front requires a new release.
   Artwork review, primary-sale routing and wallet signatures remain gates.
   Display ENS is `DBusk.decentagency.eth`; no contenthash/CID is invented here.
   No supporter has been minted, listed, transferred or charged, and no ENS
   write or supporter announcement has been performed.

Code: Apache-2.0. Upstream notices and CC-BY-4.0 license for original non-code
content are preserved in `NOTICE`, `LICENSE`, and `LICENSES/`.
