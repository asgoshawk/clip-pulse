# Tasks: Browser Rhythm Editor

**Input**: Design documents from `specs/001-browser-rhythm-editor/`

**Tests**: Mandatory Red-Green-Refactor. Test tasks precede implementation tasks.

## Phase 1: Setup

- [x] T001 Initialize the locked React/Vite/Rust workspace in package.json, Cargo.toml, and config files
- [x] T002 [P] Configure repository ignores, CSP, exact package manager, and toolchains in .gitignore, index.html, .npmrc, and rust-toolchain.toml
- [x] T003 [P] Add shared design tokens and copied shadcn primitives in src/index.css and src/components/ui/

## Phase 2: Foundational

- [x] T004 Write failing schema and reducer tests in src/lib/contracts.test.ts and src/lib/editor-state.test.ts
- [x] T005 Implement versioned contracts, defensive validation, and deterministic editor state in src/lib/contracts.ts and src/lib/editor-state.ts
- [x] T006 Write failing Rust plan compiler tests in crates/clip-pulse-core/src/lib.rs and crates/clip-pulse-core/tests/properties.rs
- [x] T007 Implement bounded render-plan compilation and beat analysis in crates/clip-pulse-core/src/lib.rs
- [x] T008 Add WASM worker protocol, cancellation, capability detection, and resource ledger tests in src/engine/
- [x] T009 Implement WASM bridge, worker protocol, cancellation, capability detection, and resource ledger in src/engine/ and src/workers/

## Phase 3: User Story 1 - Create a rhythm clip locally (P1 MVP)

- [ ] T010 [P] [US1] Write component tests for import, selection, Tap, timeline, and recovery states in src/components/editor/*.test.tsx
- [x] T011 [P] [US1] Write Playwright primary-journey and no-network tests in tests/e2e/editor.spec.ts
- [x] T012 [US1] Implement local media inspection and safe object URL lifecycle in src/engine/media.ts
- [x] T013 [US1] Implement the responsive shadcn editor shell, dropzone, preview, transport, and inspector in src/components/editor/ and src/App.tsx
- [x] T014 [US1] Implement keyboard In/Out, Tap, marker editing, undo/redo, presets, and canvas timeline in src/components/editor/BeatTimeline.tsx and src/lib/editor-state.ts
- [x] T015 [US1] Implement honest preview/export capability and local MP4 export path in src/engine/exporter.ts and src/components/editor/ExportDialog.tsx

## Phase 4: User Story 2 - Analyze and refine audio rhythm

- [ ] T016 [P] [US2] Write audio-analysis, cancellation, and rhythm-template roundtrip tests in src/engine/rhythm.test.ts
- [ ] T017 [US2] Implement chunked reference audio decoding, WASM analysis bridge, progress, cancellation, and template I/O in src/engine/rhythm.ts
- [ ] T018 [US2] Implement reference audio and refinement UI in src/components/editor/RhythmPanel.tsx

## Phase 5: User Story 3 - Mapping and audio controls

- [ ] T019 [P] [US3] Add mapping and audio-plan fixtures/tests in crates/clip-pulse-core/tests/properties.rs and src/engine/audio.test.ts
- [ ] T020 [US3] Implement four mapping modes and audio mix planning in crates/clip-pulse-core/src/lib.rs and src/engine/audio.ts
- [ ] T021 [US3] Implement mapping and audio controls in src/components/editor/MappingPanel.tsx and src/components/editor/AudioMixer.tsx

## Phase 6: Quality, security, and delivery

- [x] T022 [P] Add deterministic Storybook stories and accessibility checks in .storybook/ and src/components/editor/*.stories.tsx
- [ ] T023 [P] Add Playwright visual baselines and resource/performance checks in tests/visual/ and tests/e2e/performance.spec.ts
- [ ] T024 [P] Add Taiwan language-policy, documentation-parity, bundle-budget, audit, and license scripts in scripts/ and tests/
- [x] T025 [P] Write complete zh-TW, English, and Japanese user documentation in README*.md and docs/
- [ ] T026 Configure SHA-pinned CI, dependency review, CodeQL, Dependabot, and Pages deployment in .github/
- [ ] T027 Validate formatting, Rust tests, Vitest, Storybook, Playwright, security checks, budgets, and production build
- [ ] T028 Run quickstart acceptance and record completed tasks in specs/001-browser-rhythm-editor/tasks.md

## Dependencies & Strategy

- Setup -> Foundational -> US1. US1 is the independently deployable MVP.
- US2 and US3 follow only after US1 passes its tests and budgets.
- Quality and deployment depend on desired stories but never relax foundational gates.
- Tasks marked [P] affect separate files and may be executed concurrently; this implementation remains sequential to preserve TDD evidence.
