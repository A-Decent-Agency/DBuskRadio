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

The requested Agency treasury resolves on Ethereum mainnet to
`0xcAeEd8422fB5682C298B7F0971906d446fFd4e7a` (observed at block 26262074).
Re-resolve and review that address in the signing wallet before any grant/mint.
The steward requested adding it as an NFT admin; it was **not** an admin at Base
block 53025207. An unsigned role-grant plan is not proof of authority.

## Transactions, only after independent wallet approval

1. Existing NFT admin grants `DEFAULT_ADMIN_ROLE` to the Agency wallet on the
   approved Base NFT `0xe63EC9f8228720bAAC2fD528C0A6d06B3Dc5439B`. Keep the
   current admin; no ownership transfer/revocation is part of this request.
   Verify `hasRole` after confirmation before changing the signing account.
2. Agency admin registers Product kind `0` with max supply `1000`, the actual
   pinned metadata URI, Agency royalty receiver and `1000` royalty bps.
   Read the actual emitted token ID; don't predict the next ID.
3. Agency admin calls `mintProduct(agencyAddress, tokenId, 1000)` and verifies
   the receipt, URI, supply, balance and `royaltyInfo`.
4. **Primary sale route still needs explicit confirmation.** The existing
   community escrow `0x31b07b83e99A9bdF379bf40225b8A80d3804C89d` retains
   purchase USDC. It does not automatically send sales to the Agency wallet.
   An Agency royalty receiver or NFT admin grant does not change this routing.
   Its current owner is the personal wallet
   `0x807061DF657A7697c04045dA7d16D941861cAABc`, not the Agency wallet.
5. If the steward approves that community route, the Agency holder transfers
   1,000 editions with `safeTransferFrom` to escrow and its current owner calls
   `listDNFT(nft, tokenId, 0, BaseUSDC, 10000000, 1000, note)`.
   Do not transfer stock until the sale route is approved.

Before any public sale/announcement, independently verify confirmations,
registration/mint/stock/listing receipts, active unpaused listing, URI,
10-USDC-only price, edition quantity and actual purchase route. The existing
[DecentHead protocol](https://github.com/TheJollyLaMa/DecentHead/blob/8542720354a8eb1fb619ff7d57c23982b3b42d35/docs/SUPPORTER-RELEASES.md)
describes the approved evidence shape and checks. Never put a signing key in
GitHub Actions, this repository, a release asset, a chat or browser evaluation.
