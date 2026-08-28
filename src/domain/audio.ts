export interface ReciterMoshaf { id: number; name: string; server: string; availableSurahs: number[]; }
export interface Reciter { id: number; name: string; moshaf: ReciterMoshaf[]; provider: string; sourceUrl: string; }
