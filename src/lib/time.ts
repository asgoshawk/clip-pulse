export function parseTime(value: string): number | null {
  const input = value.trim(); if (!input) return null; const parts = input.split(':'); if (parts.length > 2 || parts.some(part => !/^\d+(?:\.\d+)?$/.test(part))) return null;
  const seconds = parts.length === 2 ? Number(parts[0]) * 60 + Number(parts[1]) : Number(parts[0]); if (!Number.isFinite(seconds) || seconds < 0 || (parts.length === 2 && Number(parts[1]) >= 60)) return null;
  return Math.round(seconds * 1e6);
}
export function formatTime(us: number): string { const seconds = Math.max(0, us) / 1e6; const minutes = Math.floor(seconds / 60); const remainder = (seconds % 60).toFixed(3).padStart(6, '0'); return minutes ? `${minutes}:${remainder}` : remainder; }
