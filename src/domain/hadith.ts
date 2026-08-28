export interface HadithSummary { id: string; title: string; provider: string; sourceUrl: string; }
export interface HadithDetail extends HadithSummary { text: string; attribution: string; grade: string; explanation: string; benefits: string[]; reference: string; }
export interface HadithCategory { id: string; title: string; count: number; parentId: string | null; }
export interface HadithPage { items: HadithSummary[]; currentPage: number; lastPage: number; totalItems: number; perPage: number; }
