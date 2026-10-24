// Plain text rather than the robots.ts metadata route, because robots.txt has
// no directive for llms.txt and Next's generator cannot emit the comment.
const BODY = `# LLM-readable summary of this site: http://localhost:3000/llms.txt

User-Agent: *
Allow: /
Disallow: /api/
Disallow: /project/
Disallow: /view/
Disallow: /admin/
Disallow: /inbox

Sitemap: http://localhost:3000/sitemap.xml
`;

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
