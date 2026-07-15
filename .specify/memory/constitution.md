<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Added principles: Specification Authority; Test-First Delivery; MVP Simplicity;
  Defensive Local Processing; Measured Performance; Secure Supply Chain;
  Taiwan Language and Accessible UX
- Added sections: Product and Technical Constraints; Delivery Gates
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
- Follow-up TODOs: none
-->
# Clip Pulse Constitution

## Core Principles

### I. Specification Authority
Every feature MUST begin with a versioned Spec Kit specification. Requirements,
acceptance criteria, assumptions, and explicit non-goals MUST be settled before
planning. Plans and tasks MUST trace back to requirement identifiers. A behavior
change MUST update the specification before implementation.

### II. Test-First Delivery (NON-NEGOTIABLE)
Implementation MUST follow Red-Green-Refactor. Tests MUST be written and observed
failing before production code is added. Pure configuration and documentation use
validation-first checks. Every defect fix MUST add a regression test. Behavior,
contract, visual, security, performance, and memory checks MUST be selected in
proportion to the risk of the change.

### III. MVP Simplicity
Only behavior required by a prioritized user story or acceptance criterion MAY be
implemented. Dependencies, abstractions, compatibility layers, editor features,
and configuration options MUST NOT be added for hypothetical future use. The P1
vertical slice MUST remain independently deployable and useful.

### IV. Defensive Local Processing
All media files, rhythm templates, worker messages, browser capabilities, and
metadata MUST be treated as untrusted. Boundaries MUST validate size, shape,
version, range, and capability before expensive processing. Cancellation, failure,
and success paths MUST release every owned browser and GPU resource. User media
MUST remain on-device and runtime telemetry MUST NOT be added.

### V. Measured Performance and Memory
Performance and memory requirements are release gates, not post-release polish.
Critical paths MUST use bounded queues, streaming I/O, backpressure, lazy loading,
and deterministic benchmarks. Main-thread responsiveness, bundle size, timeline
latency, WASM allocations, media-frame budgets, and leak deltas MUST have explicit
limits in each relevant plan.

### VI. Secure Supply Chain
Direct dependencies MUST be minimal, exact, locked, licensed, actively maintained,
and justified. Lockfiles and toolchains MUST be committed. CI MUST use frozen
installs, least privilege, full-SHA GitHub Actions, dependency review, vulnerability
scanning, and source/license checks. Floating installer versions and runtime CDN
code are prohibited.

### VII. Taiwan Language and Accessible UX
The product UI MUST use Taiwan Traditional Chinese and Taiwan terminology. Simplified
Chinese and Mainland China terminology are prohibited in UI and Taiwan-language
documents. User documentation MUST be complete in zh-TW, English, and Japanese;
engineering specifications remain canonical English. Keyboard use, focus behavior,
semantic labels, contrast, reduced motion, empty states, and recovery states MUST be
specified and tested.

## Product and Technical Constraints

- The supported MVP platform is the latest stable desktop Chrome on GitHub Pages.
- React, TypeScript, Vite, shadcn/ui, Rust/WASM, WebCodecs, WebGPU, and local browser
  file APIs form the approved implementation boundary.
- No backend, account system, cloud storage, telemetry, protected media, runtime CDN,
  or FFmpeg.wasm fallback is permitted in the MVP.
- Unsupported codecs MUST fail clearly before expensive work. Feature detection and
  a bounded Canvas fallback are required; fake capability claims are prohibited.
- Public schemas and worker protocols MUST be explicitly versioned.

## Delivery Gates

Every feature MUST complete `specify -> clarify -> plan -> tasks -> checklist ->
analyze -> implement`. A pull request is releasable only when requirement checklists,
tests, formatting, language policy, dependency audits, visual baselines, performance
budgets, memory leak checks, production build, and the feature quickstart pass. Any
exception MUST be documented in the plan's Complexity Tracking table and approved
by a constitution amendment when it conflicts with a MUST rule.

## Governance

This constitution supersedes local conventions and generated plans. Amendments MUST
include a rationale, migration impact, semantic version change, and synchronized
template updates. MAJOR versions remove or redefine principles, MINOR versions add
or materially expand principles, and PATCH versions clarify wording. Each Spec Kit
analysis and pull-request review MUST verify constitution compliance; unresolved MUST
violations block implementation or deployment.

**Version**: 1.0.0 | **Ratified**: 2026-07-15 | **Last Amended**: 2026-07-15
