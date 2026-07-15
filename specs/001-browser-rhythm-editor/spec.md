# Feature Specification: Browser Rhythm Editor

**Feature Branch**: `001-browser-rhythm-editor`

**Created**: 2026-07-15

**Status**: Approved

**Input**: Build a local-first browser editor that maps a selected video moment to user-defined rhythm, with safe, fast, memory-bounded processing and multilingual user documentation.

## User Scenarios & Testing

### User Story 1 - Create a rhythm clip locally (Priority: P1)

A desktop Chrome user imports a local video, chooses a short In/Out range, creates beat markers by tapping or using a preset, previews repeated playback, and exports a shareable rhythm clip without uploading media.

**Why this priority**: This is the smallest complete workflow that proves the product is useful.

**Independent Test**: Import one supported video, select a range, add beats, preview, and export an output whose duration and cuts match the visible timeline.

**Acceptance Scenarios**:

1. **Given** an empty editor, **When** a supported local video is selected, **Then** its preview and duration become available without any network upload.
2. **Given** loaded media, **When** the user sets valid In/Out points and taps beats, **Then** ordered editable beat markers appear on the timeline.
3. **Given** a valid selection and beats, **When** the user previews restart mapping, **Then** playback restarts from In at every beat.
4. **Given** an export-capable browser and source media with audio, **When** export completes, **Then** the user receives a local H.264/AAC MP4 with non-silent rhythm-mapped source audio and all temporary resources are released.
5. **Given** a first-time user enters composition, **When** the workspace opens, **Then** an inline guide explains output duration, clip-instance placement, and preview controls.
6. **Given** source audio and a forward clip instance, **When** preview starts, **Then** the picture, output playhead, and audible source range advance together at the selected preview volume.

---

### User Story 2 - Derive and refine rhythm from audio (Priority: P2)

A user imports a reference audio file, receives suggested beats, then adds, deletes, or drags markers before applying them to the video.

**Why this priority**: It reduces repetitive manual work while keeping the user in control.

**Independent Test**: Analyze a deterministic audio fixture, refine the resulting markers, export and re-import the rhythm template, and obtain the same ordered beats.

**Acceptance Scenarios**:

1. **Given** supported reference audio, **When** analysis runs, **Then** progress, cancellation, suggested tempo, beats, and confidence are available.
2. **Given** suggested beats, **When** markers are edited, **Then** undo and redo restore deterministic states.
3. **Given** a rhythm template, **When** it is exported and imported, **Then** its validated timing and accents are preserved without embedding media.

---

### User Story 3 - Choose mapping and audio behavior (Priority: P3)

A user chooses restart, complete-and-hold, fit-to-beat, or alternating direction, and independently mixes source sound, reference sound, and click.

**Why this priority**: These controls provide the intended creative range after the core workflow is proven.

**Independent Test**: Apply each mapping to fixed source and beat fixtures and compare the compiled segment and audio plan to expected microsecond boundaries.

**Acceptance Scenarios**:

1. **Given** uneven beat intervals, **When** each mapping is selected, **Then** its truncation, hold, speed limit, and direction rules remain deterministic.
2. **Given** source, reference, and click audio, **When** tracks are muted or adjusted, **Then** preview and export use the same mix choices.

### Edge Cases

- Unsupported, corrupt, misleading, empty, oversized, or capability-incompatible media is rejected before expensive processing.
- In/Out points cannot be inverted, equal, outside duration, or shorter than one output frame.
- Beat events cannot be non-finite, negative, duplicated, unordered, beyond duration, or exceed the documented count limit.
- Device loss, encoder failure, worker error, file-write failure, navigation, and user cancellation release owned frames, audio data, workers, object URLs, and GPU resources.
- Variable-frame-rate input is represented by source timestamps but the edited output is constant-frame-rate.
- If source-quality export is unsupported or exceeds 4K60, the editor explains and uses 1080p30.

## Requirements

### Functional Requirements

- **FR-001**: The product MUST import local MP4 or MOV without transferring the file to a remote service.
- **FR-002**: The product MUST validate the actual container, tracks, codec capability, duration, dimensions, frame rate, and audio layout before editing.
- **FR-003**: Users MUST be able to preview media and set frame-valid In and Out points.
- **FR-004**: Users MUST be able to add, remove, drag, Tap, undo, and redo ordered beat markers.
- **FR-005**: The product MUST provide original generic rhythm presets without protected recordings or brand names.
- **FR-006**: The product MUST import supported reference audio, report cancellable analysis progress, and produce editable beat suggestions.
- **FR-007**: The product MUST import and export a versioned, media-free rhythm template with strict validation.
- **FR-008**: The product MUST compile restart, complete-and-hold, fit-to-beat, and alternating-direction mappings with identical preview and export semantics.
- **FR-009**: Users MUST independently control source, reference, and click audio and explicitly opt in before reference audio is exported.
- **FR-009a**: The shared preview transport MUST expose immediate mute and volume controls; preview-only volume changes MUST NOT mutate source media or alter export gain.
- **FR-009b**: Composition preview MUST use native forward media playback between deterministic segment boundaries so that visible frames, output playhead, and source audio remain perceptibly synchronized.
- **FR-010**: The product MUST export local H.264/AAC MP4 when the browser advertises compatible encoders.
- **FR-011**: The product MUST show actual WebGPU, WebCodecs, fallback, and blocked capability states without claiming unavailable acceleration.
- **FR-012**: The product MUST provide clear empty, loading, progress, cancellation, degraded, error, recovery, and completed states.
- **FR-013**: The editor MUST be operable with keyboard and expose accessible names, focus order, contrast, and reduced-motion behavior.
- **FR-014**: The product UI MUST use Taiwan Traditional Chinese; user documentation MUST be complete in zh-TW, English, and Japanese.

### Non-Functional Requirements

- **NFR-001**: Initial JavaScript MUST remain at or below 200 KiB gzip, initial CSS at or below 50 KiB gzip, and deferred editor/media/WASM code at or below 1.5 MiB gzip.
- **NFR-002**: Timeline interaction with 1,000 beats MUST sustain at least 55fps and produce no ordinary main-thread task longer than 50ms.
- **NFR-003**: Render planning for 10,000 beats MUST complete within 50ms with at most 16 MiB temporary WASM allocation on the documented reference environment.
- **NFR-004**: Raw frame queues MUST be byte-bounded to 128 MiB and range from two to eight frames; full source files MUST NOT be copied into memory.
- **NFR-005**: After three import, preview, and cancel cycles, JavaScript heap growth MUST remain below 20 MiB on the fixed 1080p fixture and test browser.
- **NFR-006**: The product MUST reject metadata above 8K or 120fps, reference audio or output timelines above ten minutes, and malformed template input before heavy work.
- **NFR-007**: Dependency locks, vulnerability/license/source checks, full-SHA Actions, least-privilege workflows, and production CSP MUST gate deployment.
- **NFR-008**: Taiwan-language sources MUST contain no Simplified Chinese locale tags or prohibited Mainland China terminology; Japanese text is evaluated by its own language rules.

### Explicit Non-Goals

- Multi-video tracks, titles, stickers, transitions, color grading, AI generation, live camera input, accounts, cloud storage, telemetry, mobile editing, and FFmpeg.wasm fallback.
- Guaranteed decoding of HEVC, ProRes, or any codec not reported as supported by the current browser.
- Pitch-preserving time stretch, project persistence, collaboration, or embedding the generated clip back into the original source.

### Key Entities

- **MediaSource**: Local file identity and validated track/capability metadata; binary data is not persisted.
- **ClipSelection**: Validated source In/Out microseconds.
- **BeatEvent**: Stable identifier, integer microsecond time, and accent.
- **RhythmTemplate**: Versioned duration and ordered beat events without media.
- **MappingSettings**: Mapping mode, direction, speed limits, and hold policy.
- **AudioMix**: Independent source, reference, click, and master gains.
- **RenderPlan**: Deterministic source/output segments and audio operations consumed by preview and export.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A first-time user can import, select, add beats, preview, and start export within three minutes without documentation.
- **SC-002**: No user media request leaves the page origin during the complete primary journey.
- **SC-003**: Fixed rhythm fixtures produce exact ordered segment boundaries with no accumulated timing drift across ten minutes.
- **SC-004**: All documented bundle, responsiveness, queue, and leak budgets pass before deployment.
- **SC-005**: Every unsupported or malformed fixture produces a recoverable Taiwan Traditional Chinese error rather than a crash or unbounded allocation.
- **SC-006**: The zh-TW, English, and Japanese user-document sets contain the same document identifiers and documented feature set.

## Assumptions

- The supported runtime is the latest stable desktop Chrome in a secure context.
- Users own or are authorized to edit and export their chosen media.
- Preview seeks may be approximate; final render-plan timestamps are authoritative.
- The source file may be large, but random-access local file APIs remain available for its editing session.
- File System Access is preferred for output; memory Blob fallback is limited to an estimated 512 MiB.
