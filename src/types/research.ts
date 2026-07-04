export type ResearchInput = {
  query: string;
  model?: string;
};

export type CrawledPage = {
  url: string;
  title: string;
  content: string;
  depth: number;
};

export type CompanyInfo = {
  name: string;
  website: string;
  phone?: string;
  address?: string;
  products: string[];
  services: string[];
  painPoints: string[];
  industry?: string;
  summary?: string;
};

export type Competitor = {
  name: string;
  website: string;
};

export type ResearchResult = {
  company: CompanyInfo;
  competitors: Competitor[];
  crawledPages: number;
  generatedAt: string;
  pdfBase64?: string;
  pdfSize?: number;
};

export type ResearchStep =
  | "searching"
  | "crawling"
  | "analyzing"
  | "competitors"
  | "pdf"
  | "done"
  | "error";

export type SSEEvent =
  | { type: "step"; step: ResearchStep; message: string; detail?: string }
  | { type: "result"; result: ResearchResult }
  | { type: "error"; message: string };

export type DiscordConfig = {
  botToken: string;
  channelId: string;
  applicantName: string;
  applicantEmail: string;
};
