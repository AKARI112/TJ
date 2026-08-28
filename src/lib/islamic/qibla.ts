export function normalizeDegrees(value: number) { return ((value % 360) + 360) % 360; }
export function relativeQiblaDirection(qiblaBearing: number, phoneHeading: number) { return normalizeDegrees(qiblaBearing - phoneHeading); }
