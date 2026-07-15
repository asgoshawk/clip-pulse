# Implementation Plan: Browser Rhythm Editor

**Branch**: `001-browser-rhythm-editor` | **Date**: 2026-07-15 | **Spec**: [spec.md](spec.md)

## Summary

Deliver a local-only Chrome rhythm editor as one React/Vite application with a small
Rust/WASM planning core. Browser-native codec and GPU APIs perform bounded media work;
the P1 slice supports import, selection, Tap/preset beats, preview, and honest MP4
export capability. Every boundary is validated and every media resource is explicitly
owned and released.

## Technical Context

**Language/Version**: TypeScript 5.x on Node 20; Rust 1.96 targeting wasm32-unknown-unknown

**Primary Dependencies**: React, Vite, Tailwind CSS, shadcn/Radix primitives, Mediabunny,
Valibot, Lucide, wasm-bindgen

**Storage**: Session-only local File/Blob handles; File System Access output; no backend

**Testing**: Vitest, React Testing Library, cargo test, wasm-bindgen-test, Storybook,
Playwright Chromium, bundle-size and language-policy scripts

**Target Platform**: Latest stable desktop Chrome over GitHub Pages HTTPS

**Project Type**: Static local-first web application plus Rust/WASM library

**Performance Goals**: 55fps timeline at 1,000 beats; 50ms planning at 10,000 beats;
bounded 128 MiB raw-frame queue; bundle and leak budgets from NFR-001 through NFR-005

**Constraints**: No server, telemetry, runtime CDN, unbounded file reads, SharedArrayBuffer,
multi-thread WASM, FFmpeg.wasm, Simplified Chinese, or unsupported codec claims

**Scale/Scope**: One local video, one optional reference audio, ten-minute output,
four mappings, three audio sources, desktop-only MVP

## Constitution Check

- [x] Specification contains prioritized, independently testable user stories and explicit non-goals.
- [x] Test tasks precede implementation tasks and include regression coverage.
- [x] External inputs and resource cleanup paths are designed defensively.
- [x] Performance, memory, security, accessibility, and language requirements have measurable gates.
- [x] Every dependency is necessary, locked, licensed, and supply-chain reviewed.
- [x] Complexity remains inside the MVP boundary; Storybook stays development-only.

Post-design review: PASS. Contracts are versioned, media queues are bounded, and no
constitution exception is required.

## Project Structure

```text
crates/clip-pulse-core/
├── src/lib.rs
└── tests/

src/
├── components/
│   ├── editor/
│   └── ui/
├── engine/
├── lib/
├── workers/
└── App.tsx

tests/
├── e2e/
├── fixtures/
├── visual/
└── language-policy.test.mjs

docs/{zh-TW,en,ja}/
.storybook/
.github/workflows/
```

**Structure Decision**: A single static frontend keeps the runtime small. The Rust
crate is isolated because its deterministic planner and beat analysis require native
unit/property tests and compile to a lazily loaded WASM module.

## Complexity Tracking

No constitution violations.
