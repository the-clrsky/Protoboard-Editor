import { LLMS_TXT } from "@/data/agentDocs";

// Built once (needed by output: "export"); nothing here reads the request.
export const dynamic = "force-static";

// Generated (was public/llms.txt) so the links carry the site URL of the build.
export function GET() {
  return new Response(LLMS_TXT, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
