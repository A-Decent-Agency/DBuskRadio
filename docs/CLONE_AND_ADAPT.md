# Clone, adapt and support DBuskRadio

Reuse the existing [DBuskRadio repository](https://github.com/A-Decent-Agency/DBuskRadio),
not a duplicate product or supporter token. Need: an independently embeddable,
customizable radio with explicit playback consent and teardown.
The receiving closure is `widget.js` → `widget/radio-widget.js`
(`mount`) → `js/radio-client.mjs`; `upstream.json` pins DecentBusking
`948289670ed43678ea0dcaeafd8ea487bd78a2b0`. Reuse/adapt the existing product,
not a new shared player or copied website.

## Clone and customize

Follow [clone/preview and the mount example](../README.md#clone-and-try).
Static preview needs no install/build. Preserve all three relative modules.
Use `theme`, `compact`, station options, `--dbusk-*` tokens, shadow parts or
the documented host-owned renderer; keep accessible controls and failure states.
Call the returned `destroy()` on route disposal. Mount never autoplays or
connects/signs/transacts; playback needs a user gesture. The existing DecentHead
session is optional and does not make anonymous votes wallet-authenticated.

Static cloning does not provide a streaming worker. The
[deployment guide](DEPLOYMENT.md) distinguishes hosted-service onboarding from
independent worker operation. Verify exact-origin voting permission, public
media/range support, codec playback and track handoffs in the receiving host.
Origin/CORS is not authentication; do not claim one-vote-per-person security.
Never copy signing secrets or treat storage/media gateways as durable pinning.

## Existing ENS and supporter evidence

Published release: [v0.2.0](https://github.com/A-Decent-Agency/DBuskRadio/releases/tag/v0.2.0),
source commit `43cce6f26b7d4ec52ac9babb3f9cd2cae2309c16`.
The following are public release snapshots, inspected 2026-11-02, not a fresh
RPC verification or a promise of present stock:

- [Mint/ENS evidence](https://github.com/A-Decent-Agency/DBuskRadio/releases/download/v0.2.0/supporter-mint-evidence.json),
  verified `2026-10-24T19:50:25.400Z`: **100** minted editions, token **74** on Base;
  ENS **`dbusk.decentagency.eth`** (not `dbuskradio.decentagency.eth`), owner
  `0xcAeEd8422fB5682C298B7F0971906d446fFd4e7a`, resolver
  `0xF29100983E058B709F3D539b0c765937B804AC15`, contenthash for site
  `bafybeiapgtx7mm3d2rmlnxk23irwa6wlmgm7rka7vmtuppenxabc4lscge`.
- [Later listing evidence](https://github.com/A-Decent-Agency/DBuskRadio/releases/download/v0.2.0/supporter-listing-evidence.json),
  verified `2026-10-24T19:59:23.565Z`: listing **4**, initially **99**
  editions at **10 native Base USDC**, one personal reserve.
  Proceeds are **retained in community escrow**, not automatically paid to
  the minting/royalty wallet. Secondary royalty: **1,000 bps (10%)**.

Existing NFT: `0xe63EC9f8228720bAAC2fD528C0A6d06B3Dc5439B`.
Escrow: `0x31b07b83e99A9bdF379bf40225b8A80d3804C89d`.
[Support the existing listing](https://thejollylama.github.io/DecentHead/supporter/buy.html?chainId=8453&escrow=0x31b07b83e99A9bdF379bf40225b8A80d3804C89d&listingId=4).
Verify chain, token, active listing, current quantity, price and destination in
the wallet before buying. Listening needs no supporter token. Support promises
no financial return, recording rights, unlimited service or required license.
Do not register/mint a duplicate. The earlier mint snapshot's “not listed”
status predates the later listing; old preparation prose is not current status.

## Validation and support

Run `npm test` and `npm run verify`; neither needs package installation.
Tests cover actual mount/destroy/remount, no autoplay, consent boundaries,
handoffs and fail-closed service checks. Synthetic playback/votes do not prove
live delivery or permission for an adopter's origin.

[Report product issues](https://github.com/A-Decent-Agency/DBuskRadio/issues)
with version, host origin, browser, visible error and public media identifier;
never include secrets or private session data. Retain Apache-2.0 code,
CC-BY-4.0 original creative-content attribution and upstream LICENSE/NOTICE.
Station/music rights remain separate.
