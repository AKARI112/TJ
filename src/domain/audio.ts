export interface ReciterMoshaf { id: number; name: string; server: string; availableSurahs: number[]; }
export interface Reciter { id: number; name: string; moshaf: ReciterMoshaf[]; provider: string; sourceUrl: string; }

export interface AudioTrack {
  id: string;
  url: string;
  title: string;
  reciter: string;
  reciterId: number;
  riwayah: string;
  surahId: number;
  surahName: string;
  ayah?: number;
  artwork?: string;
  provider: string;
}

export type AudioRepeatMode = "off" | "track" | "queue";
