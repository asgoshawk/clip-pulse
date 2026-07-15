import { access } from 'node:fs/promises';
for (const path of ['README.md','README.en.md','README.ja.md','docs/zh-TW/guide.md','docs/en/guide.md','docs/ja/guide.md']) await access(path);
console.log('Documentation parity: zh-TW, en, ja present');
