import * as cheerio from "cheerio";

export class ContentCleaner {
  clean(html: string): string {
    const $ = cheerio.load(html);

    const removeSelectors = [
      "script",
      "style",
      "noscript",
      "iframe",
      "svg",
      "nav",
      "header",
      "footer",
      ".cookie",
      ".cookie-banner",
      ".cookie-consent",
      ".popup",
      ".modal",
      ".overlay",
      ".advertisement",
      ".ads",
      ".ad",
      ".sidebar",
      ".widget",
      ".comments",
      ".comment",
      ".share-buttons",
      ".social-share",
      ".social-media",
      ".breadcrumb",
      ".breadcrumbs",
      "[role='navigation']",
      "[role='banner']",
      "[role='contentinfo']",
      "#cookie",
      "#cookies",
      "#cookie-notice",
      "#footer",
      "#header",
      "#nav",
      "#navigation",
      "#sidebar",
      "#comments",
    ];

    removeSelectors.forEach((sel) => {
      $(sel).remove();
    });

    const mainContent =
      $("main").text() ||
      $("article").text() ||
      $('[role="main"]').text() ||
      $(".content").text() ||
      $(".main-content").text() ||
      $("body").text();

    const cleaned = mainContent
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim();

    return cleaned.substring(0, 50000);
  }
}
