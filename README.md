# Clip Pulse

一款完全在瀏覽器本機運作的節奏影片編輯器。使用者可匯入 MP4／MOV、選取動作片段、即時打拍或載入節奏範本，再由 WebCodecs 與 Mediabunny 匯出 H.264 MP4。影片不會離開裝置。

[English](README.en.md) · [日本語](README.ja.md) · [使用指南](docs/zh-TW/guide.md)

## 開發

需要 Node.js 20.19+、pnpm 9.15.4、Rust 1.96 與 wasm-pack。

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm test
cargo test --workspace
corepack pnpm dev
```

完整建置使用 `corepack pnpm build`。UI 元件可用 `corepack pnpm storybook` 個別檢視；端對端測試使用 `corepack pnpm test:e2e`。規格位於 `specs/001-browser-rhythm-editor/`。

提交前請執行 `corepack pnpm verify:local`；較耗時的 Storybook、Playwright 與 Clippy 刻意留在本機，GitHub Actions 僅保留必要測試與 Pages 建置，以節省免費帳號用量。相依套件使用精確版本、鎖定檔、停用安裝腳本及 Dependabot 監控；提交訊息遵循英文 Conventional Commits。

目前 MVP 以最新版桌面版 Chrome 為主要支援環境。音訊分析與混音仍列為後續增量；目前匯出的 MP4 為影片軌。
