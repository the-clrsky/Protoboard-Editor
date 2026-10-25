import { GUIDE_MD, markdownResponse } from "@/data/agentDocs";

// Built once (needed by output: "export"); nothing here reads the request.
export const dynamic = "force-static";

export function GET() {
  return markdownResponse(GUIDE_MD);
}
