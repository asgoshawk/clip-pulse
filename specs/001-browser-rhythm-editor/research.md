# Research: Browser Rhythm Editor

## Functional core and reactive state (2026-07-15)

- Decision: use a functional-core/imperative-shell architecture. Timeline validation, render-plan compilation, output-to-source mapping, and audio-plan transforms are total or bounded pure functions. DOM, WebCodecs, Web Audio, workers, and downloads remain explicit effect adapters.
- Decision: adopt Zustand only for long-lived editor session and granular UI selectors after the mapped-preview slice is stable. Do not persist `File`, `Blob`, media elements, decoder instances, or object URLs.
- Decision: adopt RxJS at the reference-audio/export pipeline boundary, where lazy multi-value progress, teardown, cancellation, backpressure, and worker events justify it. Do not use RxJS for ordinary local button state.
- Rationale: RxJS pipeable operators compose without mutating the input Observable and subscriptions define teardown; Zustand selector subscriptions can prevent unrelated editor panels from re-rendering. Both support the performance constraints when kept outside the deterministic domain core.
- Rejected: migrating all React state and events immediately. It increases bundle and conceptual cost before the workflows requiring those abstractions exist.

## Guided workflow and transport state (2026-07-15)

- Decision: model production as `import -> select -> rhythm -> preview` and playback as the mutually exclusive `stopped | source | range | rhythm` state machine.
- Decision: action range, source playhead, beat positions, and output duration remain separate domain values. Output duration trims or repeats the immutable render plan and never mutates the selected source range.
- Decision: accept both seconds and `minutes:seconds` as draft text, validating only on Enter or blur. Range preview loops between In and Out before the user advances.
- Rationale: this prevents native video events, range looping, and requestAnimationFrame rhythm preview from independently toggling the same boolean, while keeping transitions deterministic and testable.

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
