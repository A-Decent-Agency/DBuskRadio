# Deploy DBusk Radio

The widget is a static, dependency-free frontend. Choose either the existing
Busking broadcast or your own compatible worker. No radio/payment contract is
needed. Supporter editions are separate from listening and anonymous voting.

## A. Embed the existing broadcast

1. Clone this repository and check out the exact reviewed product commit or
   published release tag. Keep all three runtime modules and their relative
   paths. Do not use a moving CDN `main` URL in a production embed.
2. Run `npm test` and `npm run verify` with Node 22 or later. No dependency
   installation is required.
3. Copy the [README embed](../README.md#embed), or serve the demo with
   `python3 -m http.server 8080` and open `http://localhost:8080/widget.html`.
   Mount is paused; a visitor must press Play.
4. Ask the Busking operator to approve your **exact origin** for radio voting
   using `RADIO_ALLOWED_ORIGINS` on the worker. Origins have no path or trailing
   slash. A GitHub Pages project uses the account origin, not its project path.
   Never request the broader signed/upload/admin allowlist for radio alone.
5. On Node 22+, run the non-writing service check:

   ```sh
   npm run check:service -- https://decentbusking.onrender.com https://YOUR_HOST
   ```

   Replace `https://YOUR_HOST` with the actual origin. This checks vote
   preflight, ready radio state, current weekly history and media byte ranges.
   It deliberately sends **no vote** and does not prove audio decoding, a
   next-track handoff, write-route acceptance or per-person identity. If the
   station is between songs, rerun during playback; do not suppress the error.
6. In a browser on your real host, test explicit Play/Pause, volume, station
   switch, mobile layout, refresh and next-song handoff. Use your own staging
   station for a real up/down vote and verify its returned tally. Do not alter
   the community chart merely to test an embed.

HTTPS is required outside loopback development. External stations keep their own
stream/CORS/codec availability; the widget cannot guarantee third-party uptime.
There are no keys, credentials, build steps or wallet connections in this path.

## B. Operate your own broadcast

The reference server is the full DecentBusking Discord/radio worker, not a
standalone npm radio-server package. It needs a catalog and operational
credentials even when voice output and mint intake are disabled. The source
snapshot below includes the radio extraction; use a reviewed newer commit
containing it if deploying the whole application.

```sh
git clone https://github.com/TheJollyLaMa/DecentBusking.git
cd DecentBusking
git checkout da5d998ee3c5fcd4a5a739afd35b5ca091f14e8b
cd discord-bot
npm ci
cp .env.example .env
```

Use a maintained Node version satisfying **every dependency's** engine
requirement (Node 22.12+ or Node 24), plus an available FFmpeg binary. See
`discord-bot/config.js` and `.env.example` in that checkout. Populate secrets
privately on your server; never commit `.env`, expose Kubo, or paste a token into
an issue. Configure:

| Setting | Independent-station requirement |
|---|---|
| `DISCORD_TOKEN`, `JUKEBOX_CHANNEL_ID` | Your bot and music intake channel; required by the reference config even with voice disabled. Grant access only to your channels. |
| `JUKE_LOOP_TEXT_CHANNEL_ID` | Your announcement channel; enables website-radio startup. Never reuse production community IDs. |
| `JUKE_LOOP_VOICE_ENABLED` | `false` for website-only output; voice channel optional. |
| `DISABLE_MINT_FLOW` | `true` if only running radio, not artwork/mint intake. |
| `SITE_URL`, `PUBLIC_WORKER_URL` | Your HTTPS frontend and worker URLs, not the original production defaults. |
| `RADIO_ALLOWED_ORIGINS` | Your comma-separated, exact browser origins for radio votes. |
| `IPFS_ALLOWED_ORIGINS`, `MINT_OWNER_WALLET` | Required with the Pinata backend. Use your operator/origins, not someone else's permissions. These authorize broader signed operations; don't grant them merely for listening. |
| `IPFS_UPLOAD_PROVIDER`, `PINATA_JWT` | The server's Pinata account and secret. Alternatively `local` with loopback Kubo; that is not proof of off-machine durable hosting. |
| `IPFS_GATEWAY` | A gateway that serves your authorized recordings and ranges. |
| `DJUKE_PAYMENTS_ENABLED`, `DEVERT_QUEUE_PAYMENTS_ENABLED` | Keep `false`. Leave paid-contract/key settings unset for radio-only use. |
| `PORT` | Listening port; defaults to `10000`. Terminate public HTTPS at your host. |

The reference config contains default community NFT catalog addresses, scheduled
shows and announcement settings. Review these before connecting RPC or Discord:
disabling mint intake is **not** isolation of the catalog or every schedule.
Do not present this server as a generic, fully isolated station without auditing
and replacing those settings for your context. Provide only media you have
permission to stream; code licensing does not license artists' recordings.

Start in a staging guild with approved test recordings:

```sh
npm start
```

Watch the explicit website-broadcast startup/catalog and persistence messages.
The healthcheck HTTP server starting alone does not establish working radio.
Load your own worker's `/api/radio` and require `playback.ready === true`,
`nowPlaying.playId`, and a streamable CID. Back up its playlist state and test
restart recovery. For remote durable checkpoints, configure your own Pinata
account; if enabling the optional checkpoint mirror, run the shipped
`checkpoint-mirror-client.js --watch` against your worker with loopback Kubo and
the same dedicated `CHECKPOINT_MIRROR_SECRET` on both ends. Never reuse a wallet
key as that secret.

Mount the widget with `workerUrl: 'https://YOUR_WORKER'`, then run:

```sh
npm run check:service -- https://YOUR_WORKER https://YOUR_HOST
```

That command runs from the **product** checkout, not the worker folder.
Complete the browser/staging-vote checks in path A and a worker restart before
inviting listeners. This documented reference-server setup has not been rehearsed
as a clean-room, independently funded production station; do not claim otherwise.

## Release acceptance

- Product tests and frozen inventory pass from a clean checkout.
- Exact deployment commit, host URL and operator are recorded.
- Real host preflight, audio/codec, next-track handoff and staging vote verified.
- Independent reference-server limitations above are visible to adopters.
- Supporter metadata binds the exact product commit, source archive, licensed
  front/back and presentation. ENS and minting require verified wallet receipts;
  a release tag or a supporter-input draft is not evidence of minting.
