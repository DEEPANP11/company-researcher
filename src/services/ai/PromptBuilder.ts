import type { CrawledPageResult } from "@/types";

type SearchResult = {
  title: string;
  link: string;
  snippet?: string;
};

type PromptInput = {
  companyName: string;
  website: string;
  crawledPages: CrawledPageResult[];
  searchResults: SearchResult[];
  contactResults: SearchResult[];
  competitorResults: SearchResult[];
};

export function buildPrompt(input: PromptInput): string {
  const pagesSummary = input.crawledPages
    .map(
      (p) =>
        `[${p.title || "Untitled"}] (${p.url})\n${p.content.substring(0, 3000)}`
    )
    .join("\n\n---\n\n");

  const searchSnippets = input.searchResults
    .slice(0, 8)
    .map((r) => `- ${r.title}: ${r.snippet || ""}`)
    .join("\n");

  const competitorSnippets = input.competitorResults
    .slice(0, 5)
    .map((r) => `- ${r.title}: ${r.link}`)
    .join("\n");

  return `You are a company research analyst. Analyze the following company data and return a structured JSON report.

Company Name: ${input.companyName}
Website: ${input.website}

=== WEBSITE CONTENT ===
${pagesSummary || "No website content available."}

=== SEARCH RESULTS ===
${searchSnippets || "No search results available."}

=== SUGGESTED COMPETITORS ===
${competitorSnippets || "No competitor data available."}

Return ONLY valid JSON with this exact schema:
{
  "summary": "2-3 sentence company overview",
  "products": ["product1", "product2"],
  "services": ["service1", "service2"],
  "pain_points": ["AI-generated problem this company solves for its customers"],
  "industry": "industry name",
  "competitor_suggestions": [
    { "name": "Competitor Name" }
  ]
}`;
}

export function buildDiscordMessage(data: {
  applicantName: string;
  applicantEmail: string;
  companyName: string;
  companyWebsite: string;
}): string {
  return `**New Company Research Report**
━━━━━━━━━━━━━━━━━━━━━━━
**Applicant:** ${data.applicantName}
**Email:** ${data.applicantEmail}
**Company:** ${data.companyName}
**Website:** ${data.companyWebsite}
━━━━━━━━━━━━━━━━━━━━━━━`;
}
