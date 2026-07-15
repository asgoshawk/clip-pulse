# Data Model: Browser Rhythm Editor

All time values are non-negative integer microseconds.

## MediaSource

- `id`: session-stable opaque identifier
- `file`: local File reference, never serialized
- `name`, `size`, `container`
- `durationUs`, `width`, `height`, `frameRate`, `rotation`
- video/audio codec descriptions and capability result
- State: `unloaded -> inspecting -> ready | rejected -> released`

## ClipSelection

- `inUs`, `outUs`
- Invariants: inside media duration; `inUs < outUs`; at least one output frame

## RhythmTemplateV1

- `schemaVersion`: literal `1`
- `name`: 1-80 Unicode scalar values
- `durationUs`: `1..600_000_000`
- `beats`: zero to 10,000 ordered `BeatEvent` values

## BeatEvent

- `id`: unique non-empty identifier
- `timeUs`: unique value inside template duration
- `accent`: integer `1..3`

## MappingSettings

- `mode`: `restart | hold | fit | alternate`
- `minRate`: `0.5`
- `maxRate`: `3.0`

## AudioMix

- `sourceGain`, `referenceGain`, `clickGain`, `masterGain`: finite `0..1`
- Reference audio defaults to zero until explicit opt-in.

## RenderPlanV1

- `schemaVersion`: literal `1`
- `durationUs`
- ordered `segments`
- Each segment contains output start/end, source start/end, rate, direction, and hold.
- State: `draft -> validated -> previewing | exporting -> completed | cancelled | failed`

## CapabilityReport

- secure context, WebAssembly, WebCodecs decode/encode, WebGPU, File System Access
- status: `accelerated | compatible | preview-only | blocked`
- User-facing reason keys; no raw exception text.
