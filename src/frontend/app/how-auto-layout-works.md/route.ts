import { AUTO_LAYOUT_MD, markdownResponse } from "@/data/agentDocs";

// Built once (needed by output: "export"); nothing here reads the request.
export const dynamic = "force-static";

export function GET() {
  return markdownResponse(AUTO_LAYOUT_MD);
}
