import { SITE_URL } from "@/lib/site";
import { BASE_PATH } from "@/lib/mode";

// Built once (needed by output: "export"); nothing here reads the request.
export const dynamic = "force-static";

// Plain text rather than the robots.ts metadata route, because robots.txt has
// no directive for llms.txt and Next's generator cannot emit the comment.
const BODY = `# LLM-readable summary of this site: ${SITE_URL}/llms.txt

User-Agent: *
Allow: ${BASE_PATH}/
Disallow: ${BASE_PATH}/api/
Disallow: ${BASE_PATH}/project/
Disallow: ${BASE_PATH}/view/
Disallow: ${BASE_PATH}/admin/
Disallow: ${BASE_PATH}/inbox

Sitemap: ${SITE_URL}/sitemap.xml
`;

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
