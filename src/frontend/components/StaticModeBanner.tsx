"use client";

import { useEffect, useState } from "react";
import { SELF_HOST_URL } from "@/lib/mode";
import { storageKind, type StorageKind } from "@/lib/localProjects";

// Static (browser-only) build: say where projects are kept and what the
// self-hosted version adds. Warn when IndexedDB is not available.
export default function StaticModeBanner() {
  const [kind, setKind] = useState<StorageKind | null>(null);
  useEffect(() => {
    storageKind().then(setKind);
  }, []);

  return (
    <div className="mb-6 rounded-lg border border-dashed border-[#113768] dark:border-[#5b9bd5] px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
      <p>
        <span className="font-site-mono text-[#113768] dark:text-[#5b9bd5]">Browser-only version.</span> Your projects stay in this
        browser on this device. Use Export in the editor to keep a backup file.{" "}
        <a href={SELF_HOST_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--copper)] hover:underline">
          Self-host
        </a>{" "}
        the editor for accounts, share links and a parts library.
      </p>
      {kind === "localstorage" && (
        <p className="text-amber-700 dark:text-amber-400">
          This browser blocks IndexedDB, so projects use the smaller localStorage. Large projects may not fit.
        </p>
      )}
      {kind === "memory" && (
        <p className="text-red-600 dark:text-red-400">
          This browser blocks storage (private window?). Projects are lost when you close the tab: use Export.
        </p>
      )}
    </div>
  );
}
