export class UrlNormalizer {
  normalize(url: string, baseUrl: string): string | null {
    try {
      const base = new URL(baseUrl);
      const resolved = new URL(url, base);

      resolved.hash = "";
      resolved.search = "";

      let path = resolved.pathname;
      if (path.endsWith("/") && path.length > 1) {
        path = path.slice(0, -1);
      }
      resolved.pathname = path;

      const hostname = resolved.hostname.replace(/^www\./, "");
      resolved.hostname = hostname;

      if (resolved.hostname !== base.hostname.replace(/^www\./, "")) {
        return null;
      }

      const skipPatterns = [
        /\.(pdf|zip|tar|gz|mp4|mp3|avi|mov|png|jpg|jpeg|gif|svg|ico|css|js)$/i,
        /^\/cdn-cgi\//,
        /^\/wp-content\//,
        /^\/wp-admin\//,
        /^\/wp-json\//,
        /\/login/,
        /\/signup/,
        /\/register/,
        /\/auth\//,
        /\/logout/,
        /policy/,
        /privacy/,
        /terms/,
        /\/tag\//,
        /\/category\//,
        /page\//,
        /\/feed\//,
        /\/xmlrpc/,
      ];

      for (const pattern of skipPatterns) {
        if (pattern.test(resolved.pathname)) return null;
      }

      return resolved.toString().replace(/\/$/, "");
    } catch {
      return null;
    }
  }

  shouldCrawl(url: string): boolean {
    const skipPatterns = [
      /\/login/,
      /\/signup/,
      /\/register/,
      /\/auth\//,
      /\/logout/,
      /mailto:/,
      /tel:/,
      /javascript:/,
      /#/,
    ];
    return !skipPatterns.some((p) => p.test(url));
  }
}
