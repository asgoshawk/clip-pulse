# Clip Pulse

A privacy-first rhythm video editor that runs locally in the browser. Import MP4/MOV, select a motion range, tap or import beats, analyze reference audio, and export a rhythm-mapped H.264 MP4 with Rust/WASM, WebCodecs, and Mediabunny. Media never leaves the device.

[臺灣正體中文](README.md) · [日本語](README.ja.md) · [Guide](docs/en/guide.md)

## Development

Requires Node.js 20.19+, pnpm 9.15.4, Rust 1.96, and wasm-pack. Run `corepack pnpm install --frozen-lockfile`, `corepack pnpm test`, `cargo test --workspace`, then `corepack pnpm dev`. The canonical engineering specification is under `specs/001-browser-rhythm-editor/`.

The MVP targets current desktop Chrome. It uses a functional core with an imperative shell, RxJS for cancellable audio analysis, and Zustand for lightweight session state. H.264/AAC MP4 export now rhythm-maps source audio when present; reference-audio and metronome mixing remain planned increments.
