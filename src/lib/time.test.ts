import { describe, expect, it } from 'vitest';
import { formatTime, parseTime } from './time';

describe('time fields', () => {
  it('parses seconds and clock notation', () => { expect(parseTime('12.5')).toBe(12_500_000); expect(parseTime('1:02.25')).toBe(62_250_000); });
  it('rejects incomplete and invalid input without coercion', () => { expect(parseTime('')).toBeNull(); expect(parseTime('1:99')).toBeNull(); expect(parseTime('-1')).toBeNull(); });
  it('formats microseconds for editing', () => expect(formatTime(62_250_000)).toBe('1:02.250'));
});
