# Research: Browser Rhythm Editor

## Functional core and reactive state (2026-07-15)

- Decision: use a functional-core/imperative-shell architecture. Timeline validation, render-plan compilation, output-to-source mapping, and audio-plan transforms are total or bounded pure functions. DOM, WebCodecs, Web Audio, workers, and downloads remain explicit effect adapters.
- Decision: adopt Zustand only for long-lived editor session and granular UI selectors after the mapped-preview slice is stable. Do not persist `File`, `Blob`, media elements, decoder instances, or object URLs.
- Decision: adopt RxJS at the reference-audio/export pipeline boundary, where lazy multi-value progress, teardown, cancellation, backpressure, and worker events justify it. Do not use RxJS for ordinary local button state.
- Rationale: RxJS pipeable operators compose without mutating the input Observable and subscriptions define teardown; Zustand selector subscriptions can prevent unrelated editor panels from re-rendering. Both support the performance constraints when kept outside the deterministic domain core.
- Rejected: migrating all React state and events immediately. It increases bundle and conceptual cost before the workflows requiring those abstractions exist.

## Guided workflow and transport state (2026-07-16)

- Decision: model production as `import -> select -> compose` and playback as the mutually exclusive `stopped | range | composition` state machine. Rhythm controls, output preview, and export share one Compose workspace instead of separate steps.
- Decision: a beat is an output-timeline clip-instance start. Every instance restarts the immutable source range selected in step one. The editor creates an initial instance at output zero, never invents unmarked repetitions, and holds the last rendered frame across uncovered output time.
- Decision: source range, source playhead, output playhead, clip-instance positions, and output duration remain separate domain values. Changing In beyond Out moves Out forward while preserving the prior source-range length where media bounds permit.
- Decision: accept both seconds and `minutes:seconds` as draft text, validating only on Enter or blur. Range preview loops between In and Out before the user advances.
- Rationale: the two-step model matches the user's mental model—choose one action, then place copies in the finished video—while preventing native video events, range looping, and composition preview from independently toggling the same boolean.
- Decision: keep a dismissible three-action onboarding card inside Compose and place mute/volume beside the shared play control. For forward segments, seek only at segment boundaries or material drift and let native media playback advance frames and source audio between boundaries.
- Rationale: forcing `currentTime` on every animation frame leaves the media element paused, starves decoding, and cannot emit audio. Boundary synchronization preserves deterministic output timing while using Chrome's optimized media pipeline.

## Interaction references (2026-07-16)

- [Canva Beat Sync](https://www.canva.com/help/beat-sync/): use an output/audio timeline and snap clips to visible beat markers. Applied here by making every marker an explicit clip instance instead of an abstract source-video annotation.
- [CapCut Auto Cut](https://www.capcut.com/tools/auto-video-editor): expose rhythm-derived automation as editable output structure. The MVP keeps BPM and reference-audio generation, but all generated instances remain movable and removable.
- [Adobe Premiere Pro clip markers](https://helpx.adobe.com/premiere-pro/using/markers.html): distinguish source clip markers from sequence positions. Applied here by separating the source playhead from the output playhead.
- [OpenVideo](https://github.com/OpenCut-app/OpenCut): reference for a React, browser-local editing surface backed by WebCodecs.
- [elah](https://github.com/davidlyons/elah): reference for browser-native WebCodecs/WebGL rendering, integer-frame timeline modelling, and separation between preview, timeline, and rendering concerns.

## Browser media stack

**Decision**: Use Mediabunny for container inspection/muxing and WebCodecs for supported
decode/encode. Use `<video>` for interactive preview and a bounded OffscreenCanvas/WebGPU
path for exact rendering.

**Rationale**: This avoids full-file memory copies and uses Chrome hardware acceleration
without the multi-threaded WASM headers unavailable on GitHub Pages.

**Alternatives considered**: FFmpeg.wasm was rejected for download size, memory use,
cross-origin isolation, and duplicate codec work. MediaRecorder was rejected because it
does not provide deterministic source timestamps or exact edit boundaries.

## Bounded source-audio export (2026-07-16)

**Decision**: Decode only the selected source range through Mediabunny's `BlobSource` and `AudioSampleSink`, cap retained planar PCM at 64 MiB, render output audio in one-second chunks, encode AAC with WebCodecs, and mux it beside H.264 in the same MP4. Restart repeats source samples, held frames emit silence, fit mode resamples by the render-plan rate, and reverse segments reverse sample traversal.

**Rationale**: A whole-file `arrayBuffer()` or whole-output `OfflineAudioContext` would scale with source or output duration and violate the memory budget. The selected-range cache makes repeated beat access deterministic while one-second output chunks bound transient allocation and encoder backpressure.

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
