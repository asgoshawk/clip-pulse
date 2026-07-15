# Clip Pulse

ブラウザー内でローカルに動作する、プライバシー重視のリズム動画エディターです。MP4／MOV の読み込み、動作範囲の選択、タップまたはテンプレートによる拍の作成、WebCodecs と Mediabunny を使った H.264 MP4 の書き出しに対応します。メディアは端末外へ送信されません。

[臺灣正體中文](README.md) · [English](README.en.md) · [ガイド](docs/ja/guide.md)

開発には Node.js 20.19 以上、pnpm 9.15.4、Rust 1.96、wasm-pack が必要です。MVP は最新版デスクトップ Chrome を主対象とします。音声解析とミキシングは今後の追加機能であり、現在の MP4 書き出しは映像トラックのみです。
