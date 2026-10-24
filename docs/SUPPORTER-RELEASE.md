# DBusk supporter release

Approved preparation: 1,000 Base ERC-1155 product editions, 10 native Base USDC
per edition, 1,000 bps (10%) secondary royalty. No ownership or financial return
is promised; code remains Apache-2.0 with upstream notices.

Product identity: `DBusk.decentagency.eth`.
Repository: https://github.com/A-Decent-Agency/DBuskRadio.
The release version, final product commit, source archive CID, actual product
front, provenance back, rotatable HTML and metadata CID must be frozen together.
Do not reuse another product's artwork or invent an IPFS URI.

## Preparation pipeline

The two supporter workflows reuse the product kit at immutable DecentHead
commit `3b2a72f7f8c49fb2af89ea7df2ead8e338e0e870`. The root site mounts the
real widget for its front screenshot. Set repository secret `PINATA_JWT` through
GitHub settings, variable `SUPPORTER_ENS_NAME=dbusk.decentagency.eth`, and keep
`SUPPORTER_DISCORD_ENABLED=false` until minted/listed evidence, ENS resolution
and the announcement destination have been verified. No signing key belongs in CI.

After reviewing tests and root-site rendering, publish an exact-commit version
release. Its preparation workflow pins the runnable site, deterministic source
archive, actual-product front, provenance back, self-contained rotatable HTML
and metadata, freezes `supporter-release.json`, and opens the mint checklist.
Inspect every asset and the manifest before signing. Failed preparation is not
a mint; never invent or substitute missing CIDs.

## Current release and wallet split

The [v0.1.0 release](https://github.com/A-Decent-Agency/DBuskRadio/releases/tag/v0.1.0)
and its pinned preparation assets are frozen. The steward requested improving
the product front before minting: publish a new reviewed version, never replace
the v0.1.0 assets. The root now supplies a styled, responsive host shell through
CSS variables and shadow parts. The widget defaults, minimal `widget.html`
example and Canopy's original compact appearance are unchanged.

The steward corrected the earlier Agency-admin/recipient plan:
**thejollylama.eth**, `0x807061DF657A7697c04045dA7d16D941861cAABc`, handles
supporter registration/minting, initial editions and royalties.
**decentagency.eth**, `0xcAeEd8422fB5682C298B7F0971906d446fFd4e7a`, controls
the widget ENS subnames on Ethereum only. The proposed Agency NFT-admin grant
is **withdrawn**; do not sign it. Recheck personal NFT admin authority and both
ENS identities before their respective wallet signatures.

## Transactions, only after independent wallet approval

1. Verify that the personal wallet remains an admin of the approved Base NFT
   `0xe63EC9f8228720bAAC2fD528C0A6d06B3Dc5439B`. No role grant, revocation or
   ownership transfer is needed for the corrected plan.
2. Personal admin registers Product kind `0` with max supply `1000`, the actual
   reviewed-version pinned metadata URI, personal royalty receiver and `1000` bps.
   Read the actual emitted token ID; don't predict the next ID.
3. Personal admin calls `mintProduct(personalAddress, tokenId, 1000)` and verifies
   the receipt, URI, supply, balance and `royaltyInfo`.
4. **Primary sale route still needs explicit confirmation.** The existing
   community escrow `0x31b07b83e99A9bdF379bf40225b8A80d3804C89d` retains
   purchase USDC. It does not automatically forward sales to the minting wallet.
   A royalty receiver or NFT admin role does not change this routing.
   Its current owner is the personal wallet
   `0x807061DF657A7697c04045dA7d16D941861cAABc`, not the Agency wallet.
5. If the steward approves that community route, the personal holder transfers
   1,000 editions with `safeTransferFrom` to escrow and its current owner calls
   `listDNFT(nft, tokenId, 0, BaseUSDC, 10000000, 1000, note)`.
   Do not transfer stock until the sale route is approved.

Before any public sale/announcement, independently verify confirmations,
registration/mint/stock/listing receipts, active unpaused listing, URI,
10-USDC-only price, edition quantity and actual purchase route. The existing
[DecentHead protocol](https://github.com/TheJollyLaMa/DecentHead/blob/8542720354a8eb1fb619ff7d57c23982b3b42d35/docs/SUPPORTER-RELEASES.md)
describes the approved evidence shape and checks. Never put a signing key in
GitHub Actions, this repository, a release asset, a chat or browser evaluation.
