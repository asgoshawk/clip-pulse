import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseRhythmTemplate } from './contracts';

describe('parseRhythmTemplate', () => {
  it('accepts an ordered v1 template', () => {
    expect(parseRhythmTemplate({
      schemaVersion: 1,
      name: '三連拍',
      durationUs: 1_000_000,
      beats: [
        { id: 'a', timeUs: 0, accent: 2 },
        { id: 'b', timeUs: 500_000, accent: 1 },
      ],
    }).beats).toHaveLength(2);
  });

  it.each([
    ['duplicate time', [0, 0]],
    ['unordered time', [500_000, 100_000]],
    ['past duration', [0, 1_000_001]],
  ])('rejects %s', (_label, times) => {
    expect(() => parseRhythmTemplate({
      schemaVersion: 1,
      name: 'bad',
      durationUs: 1_000_000,
      beats: times.map((timeUs, index) => ({ id: String(index), timeUs, accent: 1 })),
    })).toThrow();
  });

  it('rejects unknown fields', () => {
    expect(() => parseRhythmTemplate({ schemaVersion: 1, name: 'x', durationUs: 1, beats: [], url: 'https://evil.invalid' })).toThrow();
  });

  it('validates the bundled cinematic fanfare example', () => {
    const input = JSON.parse(readFileSync(join(process.cwd(), 'public/examples/cinematic-studio-fanfare.clip-pulse.json'), 'utf8')) as unknown;
    const template = parseRhythmTemplate(input);
    expect(template.durationUs).toBe(20_500_000);
    expect(template.beats).toHaveLength(32);
  });
});
