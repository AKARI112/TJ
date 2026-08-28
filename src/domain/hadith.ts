export interface HadithSummary { id: string; title: string; provider: string; sourceUrl: string; }
export interface HadithDetail extends HadithSummary { text: string; attribution: string; grade: string; explanation: string; benefits: string[]; reference: string; }
