"use client";

import { useParams } from "next/navigation";
import SavedProjectEditor from "@/components/SavedProjectEditor";

export default function ProjectEditorPage() {
  const params = useParams();
  return <SavedProjectEditor editUuid={params.editUuid as string} />;
}
