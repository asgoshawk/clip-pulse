import { readdir, stat } from 'node:fs/promises';
const files = await readdir('dist/assets'); let total=0; for(const file of files){if(/\.(js|css|wasm)$/.test(file))total+=(await stat(`dist/assets/${file}`)).size;} if(total>1_500_000) throw new Error(`壓縮前資產 ${total} bytes 超過 1.5 MB 預算。`); console.log(`Bundle budget: ${total} / 1500000 bytes`);
