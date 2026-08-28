export function parseRepeatCount(note?: string): number { const match = note?.match(/(?:read|recite|repeat)\s+(\d+)\s*x?/i); return match ? Math.max(1, Number(match[1])) : 1; }
