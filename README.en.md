# Clip Pulse

A privacy-first rhythm video editor that runs locally in the browser. Import MP4/MOV, select a motion range, tap or import beats, and export an H.264 MP4 with WebCodecs and Mediabunny. Media never leaves the device.

[臺灣正體中文](README.md) · [日本語](README.ja.md) · [Guide](docs/en/guide.md)

## Development

Requires Node.js 20.19+, pnpm 9.15.4, Rust 1.96, and wasm-pack. Run `corepack pnpm install --frozen-lockfile`, `corepack pnpm test`, `cargo test --workspace`, then `corepack pnpm dev`. The canonical engineering specification is under `specs/001-browser-rhythm-editor/`.

The MVP targets current desktop Chrome. Audio analysis and mixing remain planned increments; current MP4 exports contain a video track.
