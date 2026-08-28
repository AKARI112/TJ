export interface HisnItem { id: string; text: string; count: number; reference: string; }
export interface HisnChapter { id: number; title: string; audio?: string; items: HisnItem[]; sourceUrl: string; provider?: string; }
