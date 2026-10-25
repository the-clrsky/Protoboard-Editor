"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SavedProjectEditor from "@/components/SavedProjectEditor";

// Static build only: a project kept in this browser, /project/open/?id=<id>.
// A static export has no dynamic routes, so the id is a query parameter.
function OpenProject() {
  const id = useSearchParams().get("id") ?? "";
  // key: a new id remounts the editor, so it loads that project
  return <SavedProjectEditor key={id} editUuid={id} />;
}

export default function OpenProjectPage() {
  return (
    <Suspense>
      <OpenProject />
    </Suspense>
  );
}
