# Research: Browser Rhythm Editor

## Browser media stack

**Decision**: Use Mediabunny for container inspection/muxing and WebCodecs for supported
decode/encode. Use `<video>` for interactive preview and a bounded OffscreenCanvas/WebGPU
path for exact rendering.

**Rationale**: This avoids full-file memory copies and uses Chrome hardware acceleration
without the multi-threaded WASM headers unavailable on GitHub Pages.

**Alternatives considered**: FFmpeg.wasm was rejected for download size, memory use,
cross-origin isolation, and duplicate codec work. MediaRecorder was rejected because it
does not provide deterministic source timestamps or exact edit boundaries.

## WASM boundary

**Decision**: Rust owns validation-independent render-plan compilation and mono onset
analysis. It accepts compact numeric arrays and returns versioned plain data.

**Rationale**: Pure deterministic logic is easy to property-test and keeps UI scheduling
out of React. WASM runs in a dedicated worker without shared memory.

**Alternatives considered**: TypeScript-only planning was simpler but would not satisfy
the required WASM capability. Multi-threaded rayon was rejected because it requires
SharedArrayBuffer and increases memory pressure.

## GPU and fallback

**Decision**: Feature-detect WebGPU and codecs. WebGPU handles exact export transforms;
Canvas 2D is a bounded compatibility fallback. Capability status is user-visible.

**Rationale**: GPU support differs by device. Honest feature detection prevents a static
site from promising acceleration or codecs that Chrome does not expose.

## State and validation

**Decision**: Use a small reducer plus selector hooks, Valibot only at external JSON and
worker boundaries, integer microseconds throughout, and AbortSignal cancellation.

**Rationale**: This avoids a global state dependency, constrains untrusted objects, and
makes undo/redo and tests deterministic.

## UI and visual testing

**Decision**: Use copied shadcn components and a compact dark-first editor. Storybook
contains deterministic component states; Playwright tests both stories and full journeys.

**Rationale**: Storybook helps visual isolation but does not duplicate real media E2E.

## Security and delivery

**Decision**: Exact package versions, frozen pnpm/Cargo locks, allowlisted lifecycle
scripts, cargo-deny/audit, dependency review, CodeQL, SHA-pinned Actions, CSP, and a
no-network runtime policy.

**Rationale**: The application processes hostile binary input and is distributed through
an automated static deployment. Reducing code and privileges reduces attack surface.
