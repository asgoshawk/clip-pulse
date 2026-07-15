# Quickstart Validation

## Prerequisites

- Node 20+, Corepack, pnpm 9.15.4
- Rust 1.96 with `wasm32-unknown-unknown`
- Latest stable desktop Chrome

## Commands

```sh
corepack pnpm install --frozen-lockfile
cargo test --workspace
corepack pnpm test
corepack pnpm build
corepack pnpm exec playwright test
```

## Primary journey

1. Start the development server and open the local HTTPS-compatible origin in Chrome.
2. Import the supported fixture from `tests/fixtures/`.
3. Set In and Out, create four beats with Space, and choose restart mapping.
4. Preview and confirm the playhead restarts at every visible marker.
5. Export MP4 when the browser reports encoder support; otherwise confirm the editor
   clearly remains preview-only without claiming export support.
6. Cancel once during analysis and once during export; verify no worker, object URL, or
   owned frame remains in the resource ledger.

Expected: no media network request, no console error, Taiwan Traditional Chinese UI,
and all performance/security checks pass before Pages deployment.
